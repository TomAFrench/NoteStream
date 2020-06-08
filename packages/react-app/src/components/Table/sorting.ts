export const FIXED = 'fixed';

export const buildOrderFieldFrom = (attr: string): string => `${attr}Order`;

export type Order = 'asc' | 'desc';

const desc = (a: any, b: any, orderBy: string, orderProp: boolean): number => {
  const order = orderProp ? buildOrderFieldFrom(orderBy) : orderBy;

  if (b[order] < a[order]) {
    return -1;
  }
  if (b[order] > a[order]) {
    return 1;
  }

  return 0;
};

// eslint-disable-next-line
export const stableSort = (dataArray:any, cmp: Function, fixed:any) => {
  const fixedElems = fixed ? dataArray.filter((elem: any) => elem.fixed) : [];
  const data = fixed
    ? dataArray.filter((elem: any) => !elem[FIXED])
    : dataArray;
  let stabilizedThis = data.map((el: any, index: number) => [el, index]);

  stabilizedThis = stabilizedThis.sort((a: any, b: any) => {
    const order = cmp(a[0], b[0]);

    if (order !== 0) {
      return order;
    }

    return a[1] - b[1];
  });

  const sortedElems = stabilizedThis.map((el: any) => el[0]);

  return fixedElems.concat(sortedElems);
};

export const getSorting = (
  order: Order,
  orderBy: string,
  orderProp: boolean,
): Function =>
  order === 'desc'
    ? (a: any, b: any) => desc(a, b, orderBy, orderProp)
    : (a: any, b: any) => -desc(a, b, orderBy, orderProp);
