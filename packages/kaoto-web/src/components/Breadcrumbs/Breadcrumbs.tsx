import './Breadcrumbs.scss';

import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import { useNavigate } from 'react-router';

export interface BreadcrumbLink {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbLink[];
  current: string;
}

export const Breadcrumbs = ({ items, current }: BreadcrumbsProps) => {
  const navigate = useNavigate();

  const handleClick = (href: string) => {
    navigate(href);
  };

  return (
    <Breadcrumb className="cs--breadcrumbs" noTrailingSlash>
      {items.map((item, index) => (
        <BreadcrumbItem
          key={index}
          onClick={() => {
            handleClick(item.href);
          }}
        >
          {item.label}
        </BreadcrumbItem>
      ))}
      <BreadcrumbItem isCurrentPage>{current}</BreadcrumbItem>
    </Breadcrumb>
  );
};

// Made with Bob
