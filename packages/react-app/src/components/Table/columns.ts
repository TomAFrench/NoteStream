export const STREAM_TABLE_ID = 'id';
export const STREAM_TABLE_RECIPIENT_ID = 'recipient';
export const STREAM_TABLE_DEPOSIT_ID = 'humanDeposit';
export const STREAM_TABLE_PROGRESS_ID = 'progress';
export const STREAM_TABLE_START_TIME_ID = 'humanStartTime';
export const STREAM_TABLE_END_TIME_ID = 'humanStopTime';
export const STREAM_TABLE_STATUS_ID = 'status';
export const STREAM_TABLE_ACTION_ID = 'action';

export type Column = {
  id: string;
  order: boolean;
  disablePadding: boolean;
  label: string;
  custom: boolean;
  align?: 'right' | 'inherit' | 'left' | 'center' | 'justify' | undefined;
  width?: number;
  style?: any;
  static?: boolean;
};

export const generateColumns = (): Column[] => {
  const nonceColumn: Column = {
    id: STREAM_TABLE_ID,
    disablePadding: false,
    label: 'Stream ID',
    custom: false,
    order: false,
    width: 10,
  };

  const recipientColumn: Column = {
    id: STREAM_TABLE_RECIPIENT_ID,
    order: false,
    disablePadding: false,
    label: 'To',
    custom: false,
    width: 200,
  };

  const depositColumn: Column = {
    id: STREAM_TABLE_DEPOSIT_ID,
    order: false,
    disablePadding: false,
    label: 'Value',
    custom: false,
    width: 120,
    static: true,
  };

  const progressColumn: Column = {
    id: STREAM_TABLE_PROGRESS_ID,
    disablePadding: false,
    order: true,
    label: 'Progress',
    custom: false,
    static: true,
  };

  const startColumn: Column = {
    id: STREAM_TABLE_START_TIME_ID,
    disablePadding: false,
    order: true,
    label: 'Start Time',
    custom: false,
  };

  const endColumn: Column = {
    id: STREAM_TABLE_END_TIME_ID,
    disablePadding: false,
    order: true,
    label: 'End Time',
    custom: false,
  };

  const actionColumn: Column = {
    id: STREAM_TABLE_ACTION_ID,
    order: false,
    disablePadding: false,
    label: '',
    custom: true,
    align: 'right',
    static: true,
  };

  return [
    nonceColumn,
    recipientColumn,
    depositColumn,
    progressColumn,
    startColumn,
    endColumn,
    actionColumn,
  ];
};
