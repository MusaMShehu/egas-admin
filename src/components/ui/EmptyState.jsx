// src/components/ui/EmptyState.jsx
import React from 'react';

const EmptyState = ({
  icon = <i className="fas fa-inbox" />,
  title = 'Nothing here yet',
  description,
  action,
}) => (
  <div className="ui-empty">
    <div className="ui-empty__icon">{icon}</div>
    <h3 className="ui-empty__title">{title}</h3>
    {description && <p className="ui-empty__description">{description}</p>}
    {action && <div className="ui-empty__action">{action}</div>}
  </div>
);

export default EmptyState;