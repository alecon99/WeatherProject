import { useState, useEffect } from 'react'

import { nanoid } from 'nanoid'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesDown, faDroplet, faEye, faLocationCrosshairs, faMagnifyingGlass, faSpinner, faWind } from '@fortawesome/free-solid-svg-icons'

import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';

import video from '../../media/video.mp4'
import gift from '../../media/gift.gif'

import '../weatherContainer/WeatherContainer.css'

const WeatherContainer = () => {

    const [loadingPosition, setLoadingPosition] = useState(false)
    const [cityForm, setCityForm] = useState("");
    const [cities, setCities] = useState("");
    const [coordinates, setCoordinates] = useState("");
    const [weather, setWeather] = useState("")
    const [weatherDays, setWeatherDays] = useState("")

    const date = new Date();

    let currentDay = String(date.getDate()).padStart(2, '0');

    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");

    let currentYear = date.getFullYear();

    let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;

    useEffect(() => {
        getWeather()
    }, [coordinates])

    const Home = () => {
        setCityForm("")
        setWeather("")
        setWeatherDays("")
    }

    const startWeatherSearch = (c) => {
        setCoordinates("")
        setCoordinates({
            lat: c.lat,
            lon: c.lon
        })
    }

    const successCallback = (position) => {
        setLoadingPosition(false)
        setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude
        })
    };

    const errorCallback = (error) => {
        setLoadingPosition(false)
        console.log(error);
    };

    const getPosition = () => {
        setLoadingPosition(true)
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    }

    const getCities = async () => {

        document.getElementById('inputCity').value = '';

        if (!cityForm) {
            console.log("enter a city");
        } else {
            try {
                setCityForm("")
                setWeather("")
                setWeatherDays("")
                const data = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityForm}&limit=${3}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`);
                const response = await data.json();
                setCities(response);
            } catch (error) {
                console.log(error);
            }
        }
    }

    const getWeather = async () => {
        if (coordinates.lat && coordinates.lon) {
            try {
                setCities("")
                const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`);
                const response = await data.json();
                setWeather(response);
                setWeatherDays("")
            } catch (error) {
                console.log(error);
            }
        }
    }

    const getWeatherNext5Days = async () => {
        if (coordinates.lat && coordinates.lon) {
            try {
                const data = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`);
                const response = await data.json();
                setWeatherDays(response);
            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <>
            <video id='background' src={video} autoPlay loop muted  ></video>
            <Container id='weather' className='p-4 mt-5 opacity-75 text-center rounded-4'>
                <div className=''>
                    <h1 className='mb-3 cursor_pointer' onClick={Home}>WeatherForecast</h1>
                    <InputGroup>
                        <Button variant="outline-dark" id="button-addon2" onClick={getPosition}>
                            {loadingPosition ?
                                <FontAwesomeIcon icon={faSpinner} spin />
                                :
                                <FontAwesomeIcon icon={faLocationCrosshairs} />
                            }
                        </Button>
                        <Form.Control
                            className='text-center'
                            placeholder='Search for your city'
                            id='inputCity'
                            aria-describedby="basic-addon1"
                            onChange={(e) => setCityForm(e.target.value)}
                        />
                        <Button variant="outline-dark" id="button-addon1" onClick={getCities}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </Button>
                    </InputGroup>
                    {cities[0] || weather ?
                        null
                        :
                        <div className='m-5'> 
                           <img src={gift} alt="" />
                        </div>
                    }
                    {cities[0] && cities.map((c) => {
                        return (
                            <div key={nanoid()} className='border rounded my-3 p-2 cursor_pointer' onClick={() => startWeatherSearch(c)}>
                                {c.name}, {c.state}, ( {c.country} )
                            </div>
                        )
                    })}
                    {weather ?
                        <Row className='my-3 p-3 border rounded'>
                            <div className='d-flex justify-content-center align-items-center'>
                                <div className='fs-1 me-2'>{weather.name}</div>
                                <div className='fs-5 d-none d-sm-block'>( {weather.sys.country} )</div>
                            </div>
                            <Col sm={5} className='d-flex align-items-center justify-content-center'>
                                <div>
                                    <div className='fs-1'>{weather.main.temp}°</div>
                                    <div className='d-flex justify-content-center'>
                                        <div className='text-primary me-2'>{weather.main.temp_min}°</div>
                                        <div className='text-danger'>{weather.main.temp_max}°</div>
                                    </div>
                                </div>
                                <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt={weather.weather[0].description} />
                            </Col>
                            <Col sm={7} className='d-flex align-items-center justify-content-between'>
                                <div>
                                    <FontAwesomeIcon icon={faAnglesDown} />
                                    <div>{weather.main.pressure}hPa</div>
                                </div>
                                <div>
                                    <FontAwesomeIcon icon={faDroplet} />
                                    <div>{weather.main.humidity}%</div>
                                </div>
                                <div>
                                    <FontAwesomeIcon icon={faEye} />
                                    <div>{weather.visibility}m</div>
                                </div>
                                <div>
                                    <FontAwesomeIcon icon={faWind} />
                                    <div>{weather.wind.speed}m/s</div>
                                </div>
                            </Col>
                            <div className='mt-4'>
                                {!weatherDays ?
                                    <Button variant='dark' onClick={getWeatherNext5Days}>Next 5 days</Button>
                                    :
                                    null
                                }
                            </div>
                        </Row>
                        :
                        null
                    }
                    <Row id='weather_days_container'>
                        {weatherDays && weatherDays.list.map((d) => {
                            var temp = (Math.floor(d.main.temp))
                            var date = JSON.stringify(d.dt_txt);
                            var splitDate =  date.split(' ');

                            console.log(date);
                            return (
                                <Col xs={6} sm={4} md={3} lg={2} key={nanoid()} className='p-2 my-2'>
                                    <div className='border rounded'>
                                        <div>{splitDate[0]}</div>
                                        <div>{splitDate[1]}</div>
                                        <div className='fs-3'>{temp}°</div>
                                        <img src={`https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`} alt={d.weather[0].description} />
                                        <div>{d.weather[0].main}</div>
                                    </div>
                                </Col>
                            )
                        })}
                    </Row>
                </div>
            </Container>
            <div className='fixed-bottom bg-white text-center'>Weather project by Alessio Conte </div>
        </>
    )
}

export default WeatherContainer