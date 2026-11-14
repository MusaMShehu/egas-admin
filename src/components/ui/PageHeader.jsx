// src/components/ui/PageHeader.jsx
import React from 'react';

/**
 * PageHeader — title + subtitle + actions row.
 * Used at the top of every admin/delivery page.
 */
const PageHeader = ({ title, subtitle, actions, back, breadcrumbs }) => (
  <header className="ui-page-header">
    {back && <div className="ui-page-header__back">{back}</div>}
    {breadcrumbs && <div className="ui-page-header__crumbs">{breadcrumbs}</div>}
    <div className="ui-page-header__row">
      <div className="ui-page-header__text">
        <h1 className="ui-page-header__title">{title}</h1>
        {subtitle && <p className="ui-page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="ui-page-header__actions">{actions}</div>}
    </div>
  </header>
);

export default PageHeader;