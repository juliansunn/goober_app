"use client";
import React from "react";

import { SidebarTrigger } from "./ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    let currentPath = "";

    return paths.map((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;

      return (
        <React.Fragment key={path}>
          <BreadcrumbItem>
            {isLast ? (
              <BreadcrumbPage>{path}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={currentPath}>{path}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isLast && <BreadcrumbSeparator />}
        </React.Fragment>
      );
    });
  };

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {pathname !== "/" && <BreadcrumbSeparator />}
            {getBreadcrumbs()}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};

export default Header;
