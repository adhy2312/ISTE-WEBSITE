import { activeEventSchema } from './activeEvent'
import { eventSchema } from './event'
import { execomMemberSchema } from './execomMember'
import { statSchema } from './stat'
import { testimonialSchema } from './testimonial'
import { siteSettingsSchema } from './siteSettings'
import { internshipSchema } from './internship'
import { pillarSchema } from './pillar'
import { benefitSchema } from './benefit'
import { announcementSchema } from './announcement'
import { faqSchema } from './faq'
import telemetryLog from './telemetry_log'

export const schemaTypes = [
  activeEventSchema,
  eventSchema,
  execomMemberSchema,
  statSchema,
  testimonialSchema,
  siteSettingsSchema,
  internshipSchema,
  pillarSchema,
  benefitSchema,
  announcementSchema,
  faqSchema,
  telemetryLog,
]
