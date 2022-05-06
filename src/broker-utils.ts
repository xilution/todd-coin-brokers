import { WhereOptions } from "sequelize/types/model";
import _ from "lodash";
import { Op } from "sequelize";

export const buildWhere = (searchCriteria?: object): WhereOptions => {
  return searchCriteria
    ? _.keys(searchCriteria).reduce((accumulator, key) => {
        const value = _.get(searchCriteria, key);
        if (value !== undefined) {
          if (key === "ids") {
            return {
              ...accumulator,
              id: { [Op.in]: value },
            };
          } else {
            return {
              ...accumulator,
              [key]: value,
            };
          }
        }

        return accumulator;
      }, {})
    : {};
};
