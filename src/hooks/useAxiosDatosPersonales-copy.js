import { useEffect, useState } from "react";
import axios from "axios";
import { mostrarAlertaError } from "../helpers/alertasHelper";
import { request } from "@ombiel/aek-lib";
import { urlGetUserDetails, apikey2 } from "../helpers/serviciosUrl";
export const useAxiosDatosPersonales = () => {

    const consultarDatos = async (idUser) => {
        //const url = 'https://uniminuto.test.digibee.io/pipeline/uniminuto/v1/servicios-banner/getUserDetails?user=000065646';
        const url = `${urlGetUserDetails}?user=${idUser}` //`https://uniminuto.test.digibee.io/pipeline/uniminuto/v1/servicios-banner/getUserDetails?user=${idUser}`;
        const headers = {
            'apikey': apikey2//'5H9CcvkLZJTgPDDCXTXTI7KC90k6prl0'
        };

        try {
            const { data } = await axios.get(url, { headers });
            return data;
        } catch (error) {

            mostrarAlertaError('Ocurrio un fallo al consultar los datos  académicos');
        }

    }

    return {
        consultarDatos,
        //obtenerIdEstudianteJwt
    }


}
