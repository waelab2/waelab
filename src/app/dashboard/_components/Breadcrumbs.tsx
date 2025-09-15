"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  let href = "/";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          href += segment + "/";

          return (
            <Fragment key={"breadcrumb-item-" + index}>
              <BreadcrumbItem className="hidden capitalize md:block">
                {index < segments.length - 1 ? (
                  <BreadcrumbLink
                    href={href}
                    className="text-white hover:text-gray-300"
                  >
                    {segment}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="text-white">
                    {segment}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < segments.length - 1 && (
                <BreadcrumbSeparator className="hidden text-white md:block" />
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
