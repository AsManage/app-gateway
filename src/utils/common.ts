export const pagination = ({ page, limit }) => {
  return {
    page: page || 1,
    limit: limit || 20,
  };
};

export const messParser = {
  In: (value: Array<any>) => {
    return { type: 'in', value };
  },
  IsNull: () => {
    return { type: 'isnull' };
  },
  Between: (from: any, to: any) => {
    return { type: 'between', value: { from, to } };
  },
  MoreThanOrEqual: (value: any) => {
    return { type: 'moreThanOrEqual', value };
  },
  LessThanOrEqual: (value: any) => {
    return { type: 'lessThanOrEqual', value };
  },
};

export const handleResponse = (
  isSuccess: boolean,
  result: any,
  message: string,
) => {
  return {
    isSuccess,
    result,
    message,
  };
};

export const generateAutoPassword = () => Math.random().toString(36).slice(-8);

export const formatterPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});
