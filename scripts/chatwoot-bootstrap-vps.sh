#!/usr/bin/env bash
# Bootstrap Chatwoot on linkdroplet-00 and emit LiNKaios runtime env lines.
set -euo pipefail

CHATWOOT_DIR="${CHATWOOT_DIR:-/opt/linktrend/chatwoot}"
REPO_DIR="${REPO_DIR:-/opt/linktrend/linkaios}"
ADMIN_EMAIL="${CHATWOOT_ADMIN_EMAIL:-product@linktrend.media}"
ADMIN_NAME="${CHATWOOT_ADMIN_NAME:-LiNKtrend Support}"

if [[ ! -d "$REPO_DIR/deploy/chatwoot" ]]; then
  echo "Missing deploy/chatwoot in $REPO_DIR"
  exit 1
fi

mkdir -p "$CHATWOOT_DIR"
cp "$REPO_DIR/deploy/chatwoot/docker-compose.deploy.yml" "$CHATWOOT_DIR/docker-compose.deploy.yml"

if [[ ! -f "$CHATWOOT_DIR/.env" ]]; then
  SECRET_KEY_BASE="$(openssl rand -hex 64)"
  POSTGRES_PASSWORD="$(openssl rand -hex 24)"
  REDIS_PASSWORD="$(openssl rand -hex 24)"
  cat >"$CHATWOOT_DIR/.env" <<EOF
FRONTEND_URL=https://chatwoot.linktrend.internal
SECRET_KEY_BASE=${SECRET_KEY_BASE}
ENABLE_ACCOUNT_SIGNUP=false
FORCE_SSL=true
POSTGRES_HOST=postgres
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DATABASE=chatwoot
RAILS_ENV=production
RAILS_MAX_THREADS=5
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
REDIS_PASSWORD=${REDIS_PASSWORD}
MAILER_SENDER_EMAIL=Chatwoot <support@linktrend.media>
EOF
fi

cd "$CHATWOOT_DIR"
docker compose -f docker-compose.deploy.yml up -d --remove-orphans
sleep 20
docker compose -f docker-compose.deploy.yml run --rm rails bundle exec rails db:chatwoot_prepare

docker compose -f docker-compose.deploy.yml run --rm rails bundle exec rails runner "
account = Account.first || Account.create!(name: 'LiNKtrend')
user = User.find_by(email: '${ADMIN_EMAIL}')
unless user
  bootstrap_password = SecureRandom.hex(24)
  user = User.create!(
    name: '${ADMIN_NAME}',
    email: '${ADMIN_EMAIL}',
    password: bootstrap_password,
    password_confirmation: bootstrap_password,
    confirmed_at: Time.now.utc
  )
end
AccountUser.find_or_create_by!(account_id: account.id, user_id: user.id) do |au|
  au.role = :administrator
end
channel = Channel::Api.find_or_create_by!(account_id: account.id) do |c|
  c.webhook_url = 'https://chatwoot.linktrend.internal'
end
inbox = Inbox.find_or_create_by!(account_id: account.id, channel_id: channel.id, channel_type: 'Channel::Api') do |i|
  i.name = 'LiNKaios Support API'
end
token = user.access_token.token
puts \"CHATWOOT_ACCOUNT_ID=#{account.id}\"
puts \"CHATWOOT_INBOX_ID=#{inbox.id}\"
puts \"CHATWOOT_API_ACCESS_TOKEN=#{token}\"
"

echo "Chatwoot bootstrap complete. Add emitted values to GSM and linkaios prod runtime env."
