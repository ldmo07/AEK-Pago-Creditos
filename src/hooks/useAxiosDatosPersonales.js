import { useEffect, useState } from "react";
import axios from "axios";
import { mostrarAlertaError } from "../helpers/alertasHelper";
import { request } from "@ombiel/aek-lib";
import {urlGetUserDetails, apikey2} from "../helpers/serviciosUrl";
export const useAxiosDatosPersonales = () => {

    const [idUser, setidUser] = useState('');

    const [userData, setUserData] = useState({
        Email: '',
        TelefonoMovil: '',
        BarrioResidencia: '',
        Direccion: '',
        TipoDireccion: '',
        IdPais: '',
        IdDepartamento: '',
        IdMunicipio: ''
    });


    
    useEffect(() => {

        request.action("get-user").end((err, response) => {
            const { idUniminuto } = response.body.extraAttrs;
            setidUser(idUniminuto);
            if (err) {
                console.log(err);
            }
        })
    }, []);
    

    // useEffect(() => {
    //    //setidUser("000636184");
    //    //setidUser("000618225")
    //    setidUser("001003627")
    // }, [])
    

    useEffect(() => {
        if (idUser != '') {
            iniciarConsultaDatos();
        }
    }, [idUser]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUserData({ ...userData, [name]: value });
    };

    const iniciarConsultaDatos = async () => {
        const data = await consultarDatos();
        setUserData({ ...data });
    }

    const consultarDatos = async () => {

        //const url = 'https://uniminuto.test.digibee.io/pipeline/uniminuto/v1/servicios-banner/getUserDetails?user=000065646';
        const url =`${urlGetUserDetails}?user=${idUser}` //`https://uniminuto.test.digibee.io/pipeline/uniminuto/v1/servicios-banner/getUserDetails?user=${idUser}`;
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

    const hayCamposVaciosUserData = (userData) => {
        // Verifica si algun campo esta vacio
        const requiredFields = ['Email', 'TelefonoMovil', 'BarrioResidencia', 'Direccion', 'TipoDireccion', 'IdPais', 'IdDepartamento', 'IdMunicipio'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                return true; // Validation fails if any field is empty
            }
        }
        return false;
    };

    return {
        ...userData,
        userData,
        idUser,
        setUserData,
        handleChange,
        hayCamposVaciosUserData
    }


}
