import { createContext, useReducer } from "react";

const INITIAL_STATE = {
  city: undefined,
  date: [],
  options: {
    adult: undefined,
    children: undefined,
    room: undefined,
  },
};

// Helper function to get default dates
const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  return [{
    startDate: today,
    endDate: tomorrow,
    key: "selection"
  }];
};

export const SearchContext = createContext(INITIAL_STATE);

const SearchReducer = (state, action) => {
  switch (action.type) {
    case "NEW_SEARCH":
      return action.payload;
    case "RESET_SEARCH":
      return INITIAL_STATE;
    default:
      return state;
  }
};

export const SearchContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(SearchReducer, INITIAL_STATE);

  return (
    <SearchContext.Provider
      value={{
        city: state.city,
        date: state.date,
        options: state.options,
        dispatch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};


















