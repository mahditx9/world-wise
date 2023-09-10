/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useReducer,
} from "react";

const BASE_URL = "http://localhost:8090";

const CitiesContext = createContext();

const initial = {
  cities: [],
  currentCity: {},
  isLoading: false,
  error: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true, error: "" };
    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };
    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
      };
    case "rejected":
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error("UNKNOWN ACTION!");
  }
};

const CitiesProvider = ({ children }) => {
  const [{ cities, currentCity, isLoading, error }, dispatch] = useReducer(
    reducer,
    initial
  );

  const getCities = async () => {
    dispatch({ type: "loading" });
    try {
      const response = await fetch(BASE_URL + "/cities");
      const data = await response.json();
      dispatch({ type: "cities/loaded", payload: data });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  };
  const addCity = async (newCity) => {
    dispatch({ type: "loading" });
    try {
      const response = await fetch(BASE_URL + "/cities", {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      dispatch({ type: "city/created", payload: data });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  };

  const getCity = async (id) => {
    dispatch({ type: "loading" });
    try {
      const response = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await response.json();
      dispatch({ type: "city/loaded", payload: data });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  };
  const deleteCity = async (id) => {
    dispatch({ type: "loading" });
    try {
      const response = await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "city/deleted", payload: id });
    } catch (error) {
      dispatch({ type: "rejected", payload: error.message });
    }
  };

  useEffect(() => {
    getCities();
  }, []);

  const values = {
    cities,
    currentCity,
    getCity,
    isLoading,
    error,
    addCity,
    deleteCity,
  };

  return (
    <CitiesContext.Provider value={values}>{children}</CitiesContext.Provider>
  );
};

const useCitiesCtx = () => {
  const ctx = useContext(CitiesContext);
  if (ctx === undefined) {
    throw new Error("Context used outside of Provider!!");
  }
  return ctx;
};

// eslint-disable-next-line react-refresh/only-export-components
export { CitiesProvider, useCitiesCtx };
