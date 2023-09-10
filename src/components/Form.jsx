/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useReducer, useEffect, useCallback } from "react";
import { useUrlPosition } from "../hooks/useUrlPosition";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import styles from "./Form.module.css";
import Button from "./Button";
import Spinner from "./Spinner";
import Message from "./Message";
import { useCitiesCtx } from "../contexts/CityContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

const reducer = (state, action) => {
  switch (action.type) {
    case "loading":
      return { ...state, isCityLoading: true, error: "" };
    case "fetched":
      return {
        ...state,
        isCityLoading: false,
        cityName: action.payload.city,
        country: action.payload.country,
        countryCode: action.payload.countryCode,
      };
    case "setDate":
      return { ...state, date: action.payload };
    case "setCity":
      return { ...state, cityName: action.payload };
    case "setNotes":
      return { ...state, notes: action.payload };
    case "error":
      return { ...state, error: action.payload, isCityLoading: false };

    default:
      throw new Error("UNKNOWN ACTION!");
  }
};
const initialState = {
  cityName: "",
  country: "",
  date: "",
  notes: "",
  isCityLoading: false,
  error: "",
  countryCode: "",
};
function Form() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { cityName, country, date, notes, isCityLoading, error, countryCode } =
    state;
  const emoji = convertToEmoji(countryCode);
  const { addCity } = useCitiesCtx();
  const [lat, lng] = useUrlPosition();
  const navigate = useNavigate();

  const getCity = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      const response = await fetch(
        `${BASE_URL}?latitude=${lat}&longitude=${lng}`
      );
      const data = await response.json();
      if (!data.countryCode) {
        throw new Error("Select Another Place!");
      }
      dispatch({
        type: "fetched",
        payload: {
          city: data.city || data.locality || "",
          country: data.countryName,
          countryCode: data.countryCode,
        },
      });
    } catch (error) {
      dispatch({ type: "error", payload: error.message });
    }
  }, [lat, lng]);

  useEffect(() => {
    getCity();
  }, [lat, lng, getCity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cityName || !date) return;
    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };
    await addCity(newCity);
    navigate("/app/cities");
  };

  if (!lat || !lng)
    return (
      <Message message="Start adding a city by clicking somewhere on the map" />
    );

  if (isCityLoading) {
    return <Spinner />;
  }
  if (error) {
    return <Message message={error} />;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) =>
            e.target.value.trim().length > 1
              ? dispatch({ type: "setCity", payload: e.target.value })
              : () => {}
          }
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          dateFormat="dd/MM/yyyy"
          selected={date}
          onChange={(date) => dispatch({ type: "setDate", payload: date })}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) =>
            dispatch({ type: "setNotes", payload: e.target.value })
          }
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <Button type="back">&larr; Back</Button>
      </div>
    </form>
  );
}

export default Form;
