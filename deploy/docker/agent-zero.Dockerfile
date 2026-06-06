# syntax=docker/dockerfile:1
#
# Build from link-agentzero repo root on linkdroplet-00:
#   docker build -f /opt/linktrend/linkaios/deploy/docker/agent-zero.Dockerfile \
#     -t linktrend/agent-zero:prod /opt/linktrend/link-agentzero
#
# Health: GET /api/health (Agent Zero UI runtime, port 80)
ARG BRANCH=main
FROM agent0ai/agent-zero-base:latest

ARG BRANCH
RUN if [ -z "$BRANCH" ]; then echo "ERROR: BRANCH build-arg is required" >&2; exit 1; fi
ENV BRANCH=$BRANCH

COPY docker/run/fs/ /
WORKDIR /a0
RUN bash /ins/pre_install.sh "$BRANCH" \
  && bash /ins/install_A0.sh "$BRANCH" \
  && bash /ins/install_additional.sh "$BRANCH" \
  && bash /ins/install_A02.sh "$BRANCH" \
  && bash /ins/post_install.sh "$BRANCH"

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD curl -fsS http://127.0.0.1:80/api/health || exit 1

RUN chmod +x /exe/initialize.sh /exe/run_A0.sh
CMD ["/exe/initialize.sh", "main"]
