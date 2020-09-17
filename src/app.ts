import Axios from "axios-observable";
import {map} from "rxjs/operators";
import {Observable, of, zip} from "rxjs";
import {AxiosResponse} from "axios";

interface Name {
    en: string
}

interface Meta {
    id: string,
    name: Name,
    contry: string,
    region: string,
    latitude: number,
    longitude: number,
    elevation: number
}

interface Data {
    date: Date,
    tavg: number,
    tmin: number,
    tmax: number,
    prcp: number,
    snow: number,
    wspd: number
}

interface DailyData {
    data: Data[]
}

interface Auth {
    token: string | undefined
}

interface Definition {
    stationId: string
}

interface Source {
    definition: Definition
}

function data<T>(axiosResponse: AxiosResponse<T>) {
    return axiosResponse.data;
}

function get(auth: Auth) {
    const apiKey = auth.token;
    const stationId = "02590";
    const metaResponse = Axios.get("https://api.meteostat.net/v2/stations/meta", {
        params: {id: stationId},
        headers: {'x-api-key': apiKey}
    })
        .pipe(map(data));
    const dailyResponse = Axios.get<DailyData>("https://api.meteostat.net/v2/stations/daily", {
        headers: {'x-api-key': apiKey},
        params: {station: stationId, start: "2020-01-01", end: "2020-01-02"}
    })
        .pipe(map(data));

    const metaAndDailyResponse = zip(metaResponse, dailyResponse);
    let promise = metaAndDailyResponse
        .toPromise();
    return promise;
}

const apiKey = process.env.API_KEY;
get({token: apiKey}).then(result => console.log(result[0].data.name))
