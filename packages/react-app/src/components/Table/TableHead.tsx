import React, { ReactElement } from 'react';

import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { Column } from './columns';

export const cellWidth = (width?: number): object | undefined => {
  if (!width) {
    return undefined;
  }

  return {
    maxWidth: `${width}px`,
  };
};

function TableHeader(props: any): ReactElement {
  const { columns, order, orderBy, onSort } = props;

  const changeSort = (property: string, orderAttr: boolean) => (): void => {
    onSort(property, orderAttr);
  };

  return (
    <TableHead>
      <TableRow>
        {columns.map((column: Column) => (
          <TableCell
            align={column.align}
            key={column.id}
            padding={column.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === column.id ? order : false}
          >
            {column.static ? (
              <div style={column.style}>{column.label}</div>
            ) : (
              <TableSortLabel
                active={orderBy === column.id}
                direction={order}
                onClick={changeSort(column.id, column.order)}
                style={column.style}
              >
                {column.label}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default TableHeader;
