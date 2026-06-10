const telemetryLog = {
  name: 'telemetry_log',
  title: 'Telemetry Log',
  type: 'document',
  fields: [
    {
      name: 'job_id',
      title: 'Job ID',
      type: 'string',
    },
    {
      name: 'action',
      title: 'Action',
      type: 'string',
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
    },
    {
      name: 'domain',
      title: 'Domain',
      type: 'string',
    },
    {
      name: 'company',
      title: 'Company',
      type: 'string',
    },
    {
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
    },
  ],
  preview: {
    select: {
      title: 'action',
      subtitle: 'company',
    },
  },
};

export default telemetryLog;
