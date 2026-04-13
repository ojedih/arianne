import { cache } from "react";
import { prisma } from "./prisma";

export type BookingPackage = {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  basePriceCents: number;
  durationMinutes: number;
  displayOrder: number;
  typeSlug: string;
  addonItems: {
    packageItemId: string;
    name: string;
    description: string | null;
    addonPriceCents: number;
  }[];
};

export type BookingBusiness = {
  id: string;
  name: string;
  handle: string;
  accentColor: string;
  borderRadius: string;
  logoPath: string;
  taxRate: number;
  currency: string;
  defaultState: string;
  phone: string;
  email: string;
  cancellationPolicyHours: number;
  availability: object;
};

export type BookingData = {
  business: BookingBusiness;
  packages: BookingPackage[];
};

export const getBookingData = cache(
  async (handle: string): Promise<BookingData | null> => {
    const business = await prisma.business.findUnique({
      where: { handle },
      include: {
        serviceTypes: {
          orderBy: { order: "asc" },
          include: {
            packages: {
              where: { isActive: true },
              orderBy: { displayOrder: "asc" },
              include: {
                items: {
                  include: { item: true },
                },
              },
            },
          },
        },
      },
    });

    if (!business) return null;

    const packages: BookingPackage[] = business.serviceTypes.flatMap((type) =>
      type.packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        shortDescription: pkg.shortDescription,
        fullDescription: pkg.fullDescription,
        images: pkg.images,
        basePriceCents: pkg.basePriceCents,
        durationMinutes: pkg.durationMinutes,
        displayOrder: pkg.displayOrder,
        typeSlug: type.slug,
        addonItems: pkg.items
          .filter((pi) => !pi.isBundled && pi.addonPriceCents != null)
          .map((pi) => ({
            packageItemId: pi.id,
            name: pi.item.name,
            description: pi.item.description ?? null,
            addonPriceCents: pi.addonPriceCents!,
          })),
      }))
    );

    return {
      business: {
        id: business.id,
        name: business.name,
        handle: business.handle,
        accentColor: business.accentColor,
        borderRadius: business.borderRadius,
        logoPath: business.logoPath,
        taxRate: business.taxRate,
        currency: business.currency,
        defaultState: business.defaultState,
        phone: business.phone,
        email: business.email,
        cancellationPolicyHours: business.cancellationPolicyHours,
        availability: business.availability as object,
      },
      packages,
    };
  }
);
