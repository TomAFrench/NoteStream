import React, { ReactElement, useState, useEffect } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TablePagination from '@material-ui/core/TablePagination';

import { makeStyles } from '@material-ui/core';
import TableHead from './TableHead';
import { getSorting, stableSort, Order } from './sorting';
import { Column } from './columns';

const sm = '8px';
const xl = '32px';
const xxl = '40px';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'white',
    borderTopRightRadius: sm,
    borderTopLeftRadius: sm,
    // boxShadow: "1px 2px 10px 0 rgba(212, 212, 211, 0.59)",
  },
  selectRoot: {
    lineHeight: xxl,
    backgroundColor: 'white',
  },
  white: {
    backgroundColor: 'white',
  },
  paginationRoot: {
    backgroundColor: 'white',
    // boxShadow: "1px 2px 10px 0 rgba(212, 212, 211, 0.59)",
    marginBottom: xl,
    borderBottomRightRadius: sm,
    borderBottomLeftRadius: sm,
  },
  loader: {
    // boxShadow: "1px 2px 10px 0 rgba(212, 212, 211, 0.59)",
  },
}));

const FIXED_HEIGHT = 49;

const backProps = {
  'aria-label': 'Previous Page',
};

const nextProps = {
  'aria-label': 'Next Page',
};

const getEmptyStyle = (emptyRows: number): object => ({
  height: FIXED_HEIGHT * emptyRows,
  borderTopRightRadius: sm,
  borderTopLeftRadius: sm,
  backgroundColor: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

type Props = {
  children: Function;
  columns: Column[];
  data: any[];
  defaultFixed: boolean;
  defaultOrder: Order;
  defaultOrderBy: string;
  defaultRowsPerPage: number;
  disableLoadingOnEmptyTable?: boolean;
  disablePagination?: boolean;
  label: string;
  noBorder?: boolean;
  size: number;
};

type State = {
  page: number;
  order: Order | undefined;
  orderBy: string | undefined;
  fixed: boolean | undefined;
  orderProp: boolean;
  rowsPerPage: number | undefined;
};

const GnoTable = (props: Props): ReactElement => {
  const classes = useStyles();

  const {
    children,
    columns,
    data,
    defaultFixed,
    defaultOrder = 'asc',
    defaultOrderBy,
    defaultRowsPerPage = 5,
    disableLoadingOnEmptyTable = false,
    disablePagination = false,
    label,
    noBorder,
    size,
  }: Props = props;

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [order, setOrder] = useState<Order>();
  const [orderBy, setOrderBy] = useState<string>();
  const [fixed, setFixed] = useState<boolean>();
  const [orderProp, setOrderProp] = useState<boolean>();

  useEffect(() => {
    if (defaultOrderBy && columns) {
      const defaultOrderCol: Column | undefined = columns.find(
        ({ id }: { id: string }) => id === defaultOrderBy,
      );

      if (defaultOrderCol?.order) {
        setOrderProp(true);
      }
    }
  }, [defaultOrderBy, columns]);

  const onSort = (newOrderBy: string, newOrderProp: boolean): void => {
    let newOrder: Order = 'desc';

    // if table was previously sorted by the user
    if (order && orderBy === newOrderBy && order === 'desc') {
      newOrder = 'asc';
    } else if (!order && defaultOrder === 'desc') {
      // if it was not sorted and defaultOrder is used
      newOrder = 'asc';
    }
    setOrder(newOrder);
    setOrderBy(newOrderBy);
    setOrderProp(newOrderProp);
    setFixed(false);
  };

  const handleChangePage = (e: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: any): void => {
    const newRowsPerPage = Number(e.target.value);
    setRowsPerPage(newRowsPerPage);
  };

  const orderByParam: string = orderBy || defaultOrderBy;
  const orderParam: Order = order || defaultOrder;
  const displayRows: number = rowsPerPage || defaultRowsPerPage;
  const fixedParam = typeof fixed !== 'undefined' ? fixed : !!defaultFixed;

  // const paginationClasses = {
  //   selectRoot: classes.selectRoot,
  //   root: !noBorder && classes.paginationRoot,
  //   input: classes.white,
  // };

  let sortedData = stableSort(
    data,
    getSorting(orderParam, orderByParam, orderProp as boolean),
    fixedParam,
  );

  if (!disablePagination) {
    sortedData = sortedData.slice(
      page * displayRows,
      page * displayRows + displayRows,
    );
  }

  const emptyRows =
    displayRows - Math.min(displayRows, data.length - page * displayRows);
  const isEmpty = size === 0 && !disableLoadingOnEmptyTable;

  return (
    <>
      {!isEmpty && (
        <Table
          aria-labelledby={label}
          size="small"
          className={noBorder ? '' : classes.root}
        >
          <TableHead
            columns={columns}
            onSort={onSort}
            order={order}
            orderBy={orderByParam}
          />
          <TableBody>{children(sortedData)}</TableBody>
        </Table>
      )}
      {isEmpty && (
        <div className={classes.loader} style={getEmptyStyle(emptyRows + 1)}>
          <CircularProgress size={60} />
        </div>
      )}
      {!disablePagination && (
        <TablePagination
          backIconButtonProps={backProps}
          // classes={paginationClasses}
          component="div"
          count={size}
          nextIconButtonProps={nextProps}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={displayRows}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      )}
    </>
  );
};

export default GnoTable;
