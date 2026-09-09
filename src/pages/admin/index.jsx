import { Award, Building2, Factory, FileCheck, Globe, Leaf, Mail, Phone, Users } from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { getCompanyProfile } from '@/services'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton, InfoBanner, SectionLabel } from '@/components/common'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Marks whether a fact is named on poppysonline.com or is an illustrative
 * addition. Nothing invented should read as published fact.
 */
function SourceTag({ sourced }) {
  return (
    <Badge variant={sourced ? 'success' : 'outline'} className="shrink-0">
      {sourced ? 'From site' : 'Illustrative'}
    </Badge>
  )
}

/* ====================================================== Administration ==== */

export function Administration() {
  const profile = useAsync(getCompanyProfile, [])
  const company = profile.data?.company
  const capacity = profile.data?.publishedCapacity ?? []
  const units = profile.data?.units ?? []

  return (
    <PageContainer>
      <PageHeader
        title="Administration"
        description="The company profile behind this system, drawn from the public record at poppysonline.com."
      />

      <InfoBanner title="Prototype notice">
        Descriptive company details on this page - profile, leadership, published capacities, buyer list, certifications
        and contact details - come from the public website. Every operational figure elsewhere in this application is
        illustrative demo data, not actual Poppys operating figures.
      </InfoBanner>

      {profile.isLoading || !company ? (
        <StatGridSkeleton count={5} />
      ) : (
        <StatGrid cols={5}>
          <StatCard label="Established" value={company.establishedYear} sublabel="Tirupur, Tamil Nadu" icon={Building2} tone="brand" />
          <StatCard label="Group turnover" value="US$100M" sublabel="Poppys Group" icon={Globe} tone="success" />
          <StatCard label="Employees" value={formatNumber(company.scale.employees)} icon={Users} tone="info" />
          <StatCard label="Factories" value={company.scale.factories} sublabel={`${company.scale.divisions}+ divisions`} icon={Factory} tone="poppy" />
          <StatCard label="Export markets" value={`${company.scale.exportCountries}+`} sublabel="countries" icon={Globe} tone="warning" />
        </StatGrid>
      )}

      {profile.isLoading || !company ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Company profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] leading-relaxed text-muted-foreground">{company.about}</p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{company.positioning}</p>
                <div>
                  <SectionLabel>Mission</SectionLabel>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{company.mission}</p>
                </div>
                <div>
                  <SectionLabel>Vision</SectionLabel>
                  <ul className="mt-1.5 space-y-1">
                    {company.vision.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poppy-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-[13px]">
                <div>
                  <SectionLabel>Registered office</SectionLabel>
                  <p className="mt-1 text-muted-foreground">
                    {company.headquarters.address}
                    <br />
                    {company.headquarters.state}, {company.headquarters.country}
                  </p>
                </div>
                <div>
                  <SectionLabel>Telephone</SectionLabel>
                  <div className="mt-1 space-y-0.5">
                    {company.contact.phones.map((phone) => (
                      <div key={phone} className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {phone}
                      </div>
                    ))}
                    <div className="text-muted-foreground">Fax {company.contact.fax}</div>
                  </div>
                </div>
                <div>
                  <SectionLabel>Email</SectionLabel>
                  <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {company.contact.email}
                  </div>
                </div>
                <div>
                  <SectionLabel>Online</SectionLabel>
                  <div className="mt-1 space-y-0.5">
                    <a href={company.contact.website} target="_blank" rel="noreferrer" className="block text-primary hover:underline">
                      poppysonline.com
                    </a>
                    <a href={company.contact.homeTextiles} target="_blank" rel="noreferrer" className="block text-primary hover:underline">
                      poppysmadeups.com - home textiles
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leadership</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {company.leadership.map((person) => (
                  <div key={person.name} className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="text-sm font-semibold text-foreground">{person.name}</div>
                    <div className="text-xs font-medium text-poppy-600">{person.title}</div>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{person.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Published capability</CardTitle>
              <p className="text-xs text-muted-foreground">
                The departmental capacities the company publishes - the basis for every plan in this system
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {capacity.map((row) => (
                  <div key={row.department} className="rounded-xl border border-border bg-card p-4">
                    <div className="text-sm font-semibold text-foreground">{row.department}</div>
                    <div className="mt-1 text-xs font-semibold text-brand-600">{row.capacity}</div>
                    <div className="mt-2 text-[12px] text-muted-foreground">{row.machines}</div>
                    <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{row.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plant registry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {units.map((unit) => (
                  <div key={unit.id} className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-center gap-2">
                      <Factory className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[13px] font-semibold text-foreground">{unit.shortName}</span>
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-foreground">{unit.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{unit.location}</div>
                    <div className="mt-2 text-[12px] text-muted-foreground">{unit.focus}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="outline">Since {unit.commissionedYear}</Badge>
                      {unit.sewingMachines > 0 && <Badge variant="brand">{unit.sewingMachines} machines</Badge>}
                      {unit.dailyPieces > 0 && <Badge variant="secondary">{formatNumber(unit.dailyPieces)} pcs/day</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Product range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {company.productSegments.map((segment) => (
                    <div key={segment.name} className="border-b border-border pb-2.5 last:border-0 last:pb-0">
                      <div className="text-[13px] font-semibold text-foreground">{segment.name}</div>
                      <div className="text-[12px] text-muted-foreground">{segment.detail}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group divisions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {company.groupDivisions.map((division) => (
                    <Badge key={division.name} variant={division.sourced ? 'secondary' : 'outline'}>
                      {division.name}
                      {!division.sourced && <span className="opacity-50">*</span>}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  * Not named on the public site - added to round out the group structure.
                </p>
                <div className="mt-4">
                  <SectionLabel>Fabric constructions</SectionLabel>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {company.fabricTypes.map((fabric) => (
                      <Badge key={fabric} variant="outline">
                        {fabric}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>What the public site carries</CardTitle>
              <p className="text-xs text-muted-foreground">
                Notes from crawling poppysonline.com, so the limits of the source are visible
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <SectionLabel>Product gallery weighting</SectionLabel>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Image counts per category are the clearest signal the site gives about where the range sits. Infants
                  and boys carry far more styles than the adult categories, and the mock order book is weighted to match.
                </p>
                <div className="mt-2.5 space-y-2">
                  {company.productGallery.map((row) => {
                    const max = Math.max(...company.productGallery.map((r) => r.images))
                    return (
                      <div key={row.segment} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 text-[12px] font-medium text-foreground">{row.segment}</span>
                        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-brand-500 to-poppy-500"
                            style={{ width: `${(row.images / max) * 100}%` }}
                          />
                        </div>
                        <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                          {row.images} images
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <SectionLabel>Source limitations</SectionLabel>
                <ul className="mt-1.5 space-y-1">
                  {company.siteNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poppy-400" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  )
}

/* ========================================================== Compliance ==== */

export function Compliance() {
  const profile = useAsync(getCompanyProfile, [])
  const company = profile.data?.company

  return (
    <PageContainer>
      <PageHeader
        title="Compliance & CSR"
        description="Certifications, trade memberships and CSR. Each item is tagged with whether it is named on the public site or added as an illustrative placeholder."
      />

      {profile.isLoading || !company ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <StatGrid cols={4}>
            <StatCard label="Certifications" value={company.certifications.length} icon={FileCheck} tone="success" />
            <StatCard label="Memberships" value={company.memberships.length} icon={Award} tone="brand" />
            <StatCard label="Key buyers" value={company.keyBuyers.length} sublabel="audited accounts" icon={Users} tone="info" />
            <StatCard label="CSR pillars" value={company.csr.pillars.length} icon={Leaf} tone="poppy" />
          </StatGrid>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <p className="text-xs text-muted-foreground">Standards named on the company quality page</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {company.certifications.map((cert) => (
                    <div
                      key={cert.name}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
                    >
                      <FileCheck
                        className={cn('h-4 w-4 shrink-0', cert.sourced ? 'text-success-600' : 'text-muted-foreground/50')}
                      />
                      <span className="flex-1 text-[13px] font-medium text-foreground">{cert.name}</span>
                      <SourceTag sourced={cert.sourced} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trade memberships</CardTitle>
                <p className="text-xs text-muted-foreground">
                  The public memberships page shows logos without captions, so these are inferred
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {company.memberships.map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
                    >
                      <Award
                        className={cn('h-4 w-4 shrink-0', member.sourced ? 'text-brand-600' : 'text-muted-foreground/50')}
                      />
                      <span className="flex-1 text-[13px] font-medium text-foreground">{member.name}</span>
                      <SourceTag sourced={member.sourced} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Corporate social responsibility</CardTitle>
                <SourceTag sourced={company.csr.sourced} />
              </div>
              <p className="text-xs text-muted-foreground">{company.csr.principle}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {company.csr.pillars.map((pillar) => (
                  <div key={pillar.title} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-success-600" />
                      <span className="text-sm font-semibold text-foreground">{pillar.title}</span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{pillar.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buyer compliance programmes</CardTitle>
              <p className="text-xs text-muted-foreground">
                Retail accounts that audit the units against their own social and technical standards
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {company.keyBuyers.map((buyer) => (
                  <Badge key={buyer} variant="brand">
                    {buyer}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  )
}
