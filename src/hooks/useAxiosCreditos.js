import axios from "axios";
import { mostrarAlertaError, mostrarAlertaExito, mostrarAlertaExitoSinTimer, mostrarAlertaFalloSinTimer } from "../helpers/alertasHelper";
import { urlObtenerCuotasCreditos, apikey, urlGenerarReciboPagoCreditos, urlRutaBaseRecibos,urlGenearIdPSE,urlPagoPSE } from "../helpers/serviciosUrl"

export const useAxiosCreditos = () => {

    const ObtenerCuotasCredito = async (idEst) => {

        const dataContract = {
            ObtenerCuotasCredito: {
                ObtenerCuotasCredito: {
                    IdEstudiante: idEst.padStart(10, "0")//"0000636184" //"0000618225"
                }
            }
        };


        const url = urlObtenerCuotasCreditos;//'https://uniminuto.test.digibee.io/pipeline/uniminuto/v1/gestion-credito/ObtenerCuotasCredito';
        const headers = {
            'apikey': apikey, //'uxpWFePgheXvuP9Tun8TYxvjb0FgeSLH',
            //'Content-Type': 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            'SOAPAction': 'ObtenerCuotasCredito'
        };

        try {
            const { data } = await axios.post(url, dataContract, { headers });
            const { InformacionCredito,ResultadoTrasaccion } = data.Envelope.Body.ObtenerCuotasCreditoResponse.ObtenerCuotasCreditoResponse;

            if(ResultadoTrasaccion.Codigo === "9"){
                console.log("entro codigo 9")
                mostrarAlertaExito("El estudiante no tiene créditos activos");
                return [];
            }

            if (Array.isArray(InformacionCredito)) {
                console.log("Si array");

                return InformacionCredito;
            }
            console.log({ InformacionCredito, data });
            return [InformacionCredito];

        } catch (error) {
            console.log({error});
            mostrarAlertaError("Error consultando cuotas de credito");
        }

    }

    const GenerarReiciboPagoCredito = async (credito = {}, cuotas = [], userData = {}) => {

        //elimino el valor IdCreditoConvenio del arreglo de cuotas seleccionadas
        const cuotasSeleccionadasSinId = cuotas.map(({ IdCreditoConvenio, ...rest }) => rest);

        //Agrego al arreglo de cuotas la llave valor de FechaPagoHoy
        const cuotasConFechaPagoHoy = cuotasSeleccionadasSinId.map(cuota => ({
            ...cuota,
            "FechaPagoHoy": "X"
        }));
        

        const dataContract = {
            GenerarReciboPagoCredConvenio: {
                GenerarReciboPagoCredConvenio: {
                    CreditoEstudiante: {
                        NumerodeInterlocutor: userData.UidEstudiante.padStart(10, "0"),  //relleno de ceroz a la izquierda hasta que la longitud del string sea 10 "0000636184",
                        idCreditoConvenio: credito.IdCreditoConvenio,//"130000120330",
                        CuentaContrato: credito.CuentaContrato, //"001000581149",
                        ValorMora: credito.ValorInteresMora,//"0",
                        ValorGastos: credito.GastosCobranza,//"0",
                        Email: userData.EmailInstitucional,//"mariana.rojas-m@uniminuto.edu.co",
                        // CuotasCredito: [
                        //     {
                        //         "Cliente": "500",
                        //         "NumeroCuota": "0001",
                        //         "ValorTotalCuota": "309,070",
                        //         "FechaVencimiento": "20220302",
                        //         "FechaPagoHoy": "X"
                        //     },
                        //     {
                        //         "Cliente": "500",
                        //         "NumeroCuota": "0002",
                        //         "ValorTotalCuota": "259,069",
                        //         "FechaVencimiento": "20220402",
                        //         "FechaPagoHoy": "X"
                        //     }
                        // ]
                        CuotasCredito: cuotasConFechaPagoHoy
                    }
                }
            }
        }
       
        const url = urlGenerarReciboPagoCreditos;//'https://uniminuto.test.digibee.io/pipeline/uniminuto/v1/gestion-credito/GenerarReciboPagoCredConvenio';
        const headers = {
            'apikey': apikey, //'uxpWFePgheXvuP9Tun8TYxvjb0FgeSLH',
            //'Content-Type': 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            'SOAPAction': 'GenerarReciboPagoCredConvenio'
        };

        try {
            const { data } = await axios.post(url, dataContract, { headers });
            const { ReciboPago } = data.Envelope.Body.GenerarReciboPagoCredConvenioResponse.GenerarReciboPagoCredConvenioResponse;
            return {
                ...ReciboPago,
                urlRecibo: `${urlRutaBaseRecibos}/${ReciboPago.IdArchivo}`
            };

        } catch (error) {
            mostrarAlertaError("Error generando recibo de credito");
        }
    }

    const GenerarIdPagoPSE = async (numeroReciboGenerado,totalPagar,userData = {}) => {
        const dataContract = {
            Estudiante: {
                valorTotal: totalPagar.toString(),//"307626",
                valorIva: "0",
                recibo_pago: numeroReciboGenerado,//"0002722346",
                descripcion_pago: "Pago de Credito Uniminuto",
                email: userData.EmailInstitucional,//"ccuervoaven@uniminuto.edu.co",
                idEstudiante: userData.UidEstudiante,//"000618225",
                nombres: userData.Nombre,//"CRISTIAN CAMILO",
                apellidos: userData.Apellido,//"CUERVO AVENDAÑO",
                telefono: userData.TelefonoMovil//"3154372348"
            }
        }

        // console.log(dataContract);
        // return;

        const url = urlGenearIdPSE;//'https://uniminuto.test.digibee.io/pipeline/uniminuto/v1/pasarelas-pago/linkPagoCredZonaPagos';
        const headers = {
            'apikey': apikey, //'uxpWFePgheXvuP9Tun8TYxvjb0FgeSLH',
            'Content-Type': 'application/json',
            'SOAPAction': 'ZonaPagosCredPSE'
        };

        try {
            const { data } = await axios.post(url, dataContract, { headers });
            const { inicio_pagoV2Result } = data.inicio_pagoV2Response;
            console.log({pse:inicio_pagoV2Result});
            
            return {
                idPSE : inicio_pagoV2Result,
                linkPagoPSE : `${urlPagoPSE}${inicio_pagoV2Result}`
            };

        } catch (error) {
            mostrarAlertaError("Error generando recibo de credito");
        }
    }

    return {
        ObtenerCuotasCredito,
        GenerarReiciboPagoCredito,
        GenerarIdPagoPSE,
    }
}
