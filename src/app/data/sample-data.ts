import { WorkCenterDocument, WorkOrderDocument } from '../models/schedule.models';

const isoOffset = (days: number): string => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const SAMPLE_WORK_CENTERS: WorkCenterDocument[] = [
  { docId: 'wc-genesis', docType: 'workCenter', data: { name: 'Genesis Hardware' } },
  { docId: 'wc-rodiques', docType: 'workCenter', data: { name: 'Rodiques Electrics' } },
  { docId: 'wc-konsulting', docType: 'workCenter', data: { name: 'Konsulting Inc' } },
  { docId: 'wc-mcmarrow', docType: 'workCenter', data: { name: 'McMarrow Distribution' } },
  { docId: 'wc-spartan', docType: 'workCenter', data: { name: 'Spartan Manufacturing' } },
];

export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = [
  {
    docId: 'wo-1',
    docType: 'workOrder',
    data: {
      name: 'Calibrate cutting line',
      workCenterId: 'wc-genesis',
      status: 'complete',
      startDate: isoOffset(-24),
      endDate: isoOffset(-16),
    },
  },
  {
    docId: 'wo-2',
    docType: 'workOrder',
    data: {
      name: 'Fabricate housing',
      workCenterId: 'wc-rodiques',
      status: 'in-progress',
      startDate: isoOffset(-10),
      endDate: isoOffset(-2),
    },
  },
  {
    docId: 'wo-3',
    docType: 'workOrder',
    data: {
      name: 'Final assembly',
      workCenterId: 'wc-konsulting',
      status: 'in-progress',
      startDate: isoOffset(-18),
      endDate: isoOffset(-5),
    },
  },
  {
    docId: 'wo-4',
    docType: 'workOrder',
    data: {
      name: 'Compleks Systems',
      workCenterId: 'wc-konsulting',
      status: 'open',
      startDate: isoOffset(3),
      endDate: isoOffset(16),
    },
  },
  {
    docId: 'wo-5',
    docType: 'workOrder',
    data: {
      name: 'Material inspection',
      workCenterId: 'wc-mcmarrow',
      status: 'blocked',
      startDate: isoOffset(-7),
      endDate: isoOffset(11),
    },
  },
  {
    docId: 'wo-6',
    docType: 'workOrder',
    data: {
      name: 'Tooling setup',
      workCenterId: 'wc-spartan',
      status: 'open',
      startDate: isoOffset(-28),
      endDate: isoOffset(-21),
    },
  },
  {
    docId: 'wo-7',
    docType: 'workOrder',
    data: {
      name: 'Production run',
      workCenterId: 'wc-spartan',
      status: 'in-progress',
      startDate: isoOffset(-17),
      endDate: isoOffset(-8),
    },
  },
  {
    docId: 'wo-8',
    docType: 'workOrder',
    data: {
      name: 'Quality review',
      workCenterId: 'wc-spartan',
      status: 'complete',
      startDate: isoOffset(4),
      endDate: isoOffset(12),
    },
  },
];
