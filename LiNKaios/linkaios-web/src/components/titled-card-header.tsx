import type { LucideIcon } from "lucide-react";

import { CARD, TYPE } from "@/lib/ui-standards";

export function CardBodyInset(props: { children: React.ReactNode; className?: string }) {
  return <div className={props.className ? `${CARD.contentInset} ${props.className}` : CARD.contentInset}>{props.children}</div>;
}

export function TitledCardHeader(props: {
  icon: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  titleClassName?: string;
  iconClassName?: string;
  /** When true, description and card body align to the card edge (not under the title icon). */
  flushContent?: boolean;
}) {
  const Icon = props.icon;
  const descriptionBlock = props.description ? <p className={CARD.description}>{props.description}</p> : null;

  if (props.flushContent) {
    return (
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className={CARD.titleIconWrap}>
              <Icon className={props.iconClassName ?? CARD.titleIcon} aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className={props.titleClassName ?? CARD.title}>{props.title}</h3>
            </div>
          </div>
          {props.action}
        </div>
        {props.description ? <p className={CARD.description}>{props.description}</p> : null}
      </div>
    );
  }

  if (props.action) {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className={CARD.titleIconWrap}>
              <Icon className={props.iconClassName ?? CARD.titleIcon} aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className={props.titleClassName ?? CARD.title}>{props.title}</h3>
            </div>
          </div>
          {props.action}
        </div>
        {descriptionBlock ? (
          <p className={`${CARD.contentInset} min-w-0 ${TYPE.bodyMuted}`}>{props.description}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className={CARD.titleIconWrap}>
          <Icon className={props.iconClassName ?? CARD.titleIcon} aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className={props.titleClassName ?? CARD.title}>{props.title}</h3>
          {descriptionBlock}
        </div>
      </div>
    </div>
  );
}
