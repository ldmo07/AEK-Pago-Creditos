import React, { useEffect, useState } from "react";
import { estiloFuentes, estiloBadges, estiloBadges2, estiloBase, estiloHover } from "../../helpers/estilos"
import { mostrarAlertaConfirmacion, mostrarAlertaError } from "../../helpers/alertasHelper";
import { useAxiosCreditos } from "../../hooks/useAxiosCreditos";
import { useAxiosDatosPersonales } from "../../hooks/useAxiosDatosPersonales-copy";
import { request } from "@ombiel/aek-lib";

export default Screen = () => {

  const { consultarDatos } = useAxiosDatosPersonales(); // objeto que almacena la informacion del usuario
  const [idUser, setIdUser] = useState("");
  const [userData, setUserData] = useState({});
  const { ObtenerCuotasCredito, GenerarReiciboPagoCredito, GenerarIdPagoPSE } = useAxiosCreditos(); //Metodo encargarado de obtener la infromacion de las cuotas de creditos
  const [infoCreditos, setinfoCreditos] = useState([]); //Maneja el estado de las condiciones de pago
  const [planCredito, setPlanCredito] = useState([]); // Maneja el estado de los Planes de Cuota Credito
  const [creditoSeleccionado, setCreditoSeleccionado] = useState({});//Maneja el estado del Credito seleccionado
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState([]); // Maneja el estado de las cuotas seleccionadas 
  const [mostrarDivCargando, setMostrarDivCargando] = useState(false); //state que indica si se deve mostrar o no el div de cargando
  const [isHovered, setIsHovered] = useState(false); //Manejara el estado para ver si se hizo hover sobre un elemento
  const [btnGenerarReciboIsDisabled, setBtnGenerarReciboIsDisabled] = useState(false); //Manejara el estado para ver si el boton de generar recibo esta habilitado o no
  const [generandoIdPse, setGenerandoIdPse] = useState(false);// Maneja el estado para saber si se esta generando el id de pse o si no
  const [numeroReciboGenerado, setNumeroReciboGenerado] = useState("");// Almacenara el estado del numero de la factura o recibo generado
  const [totalPagar, setTotalPagar] = useState(0); // Manejara el estado de la suma de las cuotas seleccionadas


  useEffect(() => {

    request.action("get-user").end((err, response) => {
      const { idUniminuto } = response.body.extraAttrs;
      console.log({idUniminuto});
      setIdUser(idUniminuto);
      if (err) {
        console.log(err);
      }
    })
    //setIdUser("000746978")
  }, []);

  useEffect(() => {
    if (idUser != "") {
      const consultarDataUsuario = async () => {
        const dataUser = await consultarDatos(idUser);
        setUserData(dataUser)
      }

      consultarDataUsuario();
    }

  }, [idUser])

  useEffect(() => {
    if (Object.keys(userData).length > 0) {
      // consulta las cuotas de creditos
      const consultarCuotasCreditos = async () => {
        try {
          setMostrarDivCargando(true);

          // Esperar 2 segundos antes de continuar
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log("espero 2 segundos");

          const dataCreditos = await ObtenerCuotasCredito(idUser);

          if (dataCreditos) {
            setinfoCreditos(dataCreditos);
          }
          setMostrarDivCargando(false)

        } catch (error) {
          setMostrarDivCargando(false)
          mostrarAlertaError("Ocurrio un fallo en el proceso");
        }
      }

      consultarCuotasCreditos();

    }

  }, [userData])


  useEffect(() => {
    if (Object.keys(creditoSeleccionado).length > 0) {
      //Inicializo el valor a pagar cuando se selecciona el credito para luego sumarle las cuotas seleccionadas
      const sumaInicial = (convertirACadenaNumerica(creditoSeleccionado.ValorInteresMora) + convertirACadenaNumerica(creditoSeleccionado.GastosCobranza))
      setTotalPagar(sumaInicial);
    }

  }, [creditoSeleccionado])


  //convierte a numero sin separador de mil las cadenas que vengan con punto por ejemplo 100.215 a 100215
  const convertirACadenaNumerica = (cadena) => {
    // Eliminar los puntos que actúan como separadores de miles
    //cadena = cadena.replace(/\./g, "");

    // Eliminar los puntos y comas que actúan como separadores de miles
    cadena = cadena.replace(/[.,]/g, "");

    // Reemplazar la coma por un punto si existe
    cadena = cadena.replace(",", ".");
    // Convertir la cadena a número
    let numero = parseFloat(cadena);
    return numero;
  }

  //Se encarga de insertar o eliminar en el arreglo de cuotas seleccionadas
  const handleCuotasSeleccionadas = (cuotaSelecionada) => {
    setCuotasSeleccionadas((prev) => {
      if (prev.includes(cuotaSelecionada)) {
        // Si el item ya está seleccionado, lo eliminamos del arreglo
        if (totalPagar > 0) {
          //resto al total si se deselecciona una cuota
          //const total = totalPagar - parseFloat(cuotaSelecionada.ValorTotalCuota.replace(/,/g, ''))
          const total = totalPagar - convertirACadenaNumerica(cuotaSelecionada.ValorTotalCuota);
          setTotalPagar(total);
        }
        return prev.filter((i) => i !== cuotaSelecionada);
      } else {
        // Si el item no está seleccionado, lo agregamos al arreglo y sumo el valor de la cuota seleccionada al total a pagar
        //const total = totalPagar + parseFloat(cuotaSelecionada.ValorTotalCuota.replace(/,/g, ''))
        const total = totalPagar + convertirACadenaNumerica(cuotaSelecionada.ValorTotalCuota);
        setTotalPagar(total);
        return [...prev, cuotaSelecionada];
      }
    });
  };

  //esta funcion maneja el evento cuando se cambia el credito
  const handleCreditoSeleccionado = (e) => {
    const { name, value } = e.target;

    if (name === 'idCreditoSeleccionado') {

      if (value === "0000") {
        setCreditoSeleccionado(undefined);
        return;
      }
      //Filtro los creditos y se la seteo al State
      const creditoElejido = infoCreditos.filter(cred => cred.IdCreditoConvenio === value)[0];
      setCreditoSeleccionado(creditoElejido)
      setPlanCredito(creditoElejido.PlanCuotaCredito);
    }
  }

  const handleClickGenerarRecibo = async (e) => {
    setBtnGenerarReciboIsDisabled(true);
    //llamo el metodo para mostrar alerta de confirmacion para generar el recibo
    const res = await mostrarAlertaConfirmacion("Está seguro de generar el recibo de pago con los valores seleccionados?", "Generar");
    if (res.isConfirmed === false) {
      setBtnGenerarReciboIsDisabled(false);
      return;
    }
    try {
      const { urlRecibo, NumeroReciboFactura } = await GenerarReiciboPagoCredito(creditoSeleccionado, cuotasSeleccionadas, userData);
      console.log({ urlRecibo, NumeroReciboFactura });
      setNumeroReciboGenerado(NumeroReciboFactura)
      await mostrarAlertaConfirmacion("Recibo de pago generado exitosamente", `<a href=${urlRecibo} target="_blank"> Descargar recibo </a>`);
    } catch (error) {
      setBtnGenerarReciboIsDisabled(false);
    }

    setBtnGenerarReciboIsDisabled(false);
  }

  //Este metodo se encarga de generar el id de pago de pse y mostrar la url de la pasarela de pagos
  const handleGenerarUrlPSE = async (e) => {

    if (numeroReciboGenerado == "") {
      mostrarAlertaError("El Recibo de Pago correspondiente al monto seleccionado aún no ha sido generado. Le solicitamos que primero genere el recibo y, posteriormente, proceda con el pago en línea.")
      return;
    }

    //llamo el metodo para mostrar alerta de confirmacion para generar el link de pago por pse
    const res = await mostrarAlertaConfirmacion("¿Está seguro de realizar el pago online de este recibo?", "Si");
    if (res.isConfirmed === false) {
      return;
    }

    try {
      setGenerandoIdPse(true)
      const { idPSE, linkPagoPSE } = await GenerarIdPagoPSE(numeroReciboGenerado, totalPagar, userData)
      if (idPSE != "") {
        await mostrarAlertaConfirmacion("A continuación, te redirigiremos al sitio de pagos en linea", `<a href=${linkPagoPSE} target="_blank">Efectuar Pago</a>`);
      }
      setGenerandoIdPse(false)
    } catch (error) {
      setGenerandoIdPse(false)
    }

  }

  return (
    <>
      <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet" />

      <div className="container mx-auto px-4 py-10 bg-white p-4" style={estiloFuentes}>

        {
          (mostrarDivCargando) && <div className="flex justify-center items-center">
            <label style={estiloBadges} htmlFor="idPrograma" className="w-full py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-700">Cargando....</label>
          </div>
        }

        {(infoCreditos.length > 0) &&
          <fieldset className="border-2 border-gray-400 rounded-lg p-4 shadow-lg">
            <legend className="text-lg font-semibold">Creditos Pendientes
              <select
                className="ml-4 flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                id="idCreditoSeleccionado"
                name="idCreditoSeleccionado"
                onChange={handleCreditoSeleccionado}
              >
                {(Object.keys(creditoSeleccionado).length === 0) && <option key={"0000"} value={"0000"} style={{ color: 'red' }}>
                  --Selecciona un credito--
                </option>}
                {infoCreditos.map((cred) => (
                  <option key={cred.IdCreditoConvenio} value={cred.IdCreditoConvenio}>
                    {cred.DescripcionPrograma}
                  </option>
                ))}
              </select>
            </legend>
            {(Object.keys(creditoSeleccionado).length > 0) && <div>
              <table className="border-collapse border border-gray-400 w-full mt-2">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="border border-gray-400 p-2">N° Credito</th>
                    <th className="border border-gray-400 p-2">Programa Académico</th>
                    <th className="border border-gray-400 p-2">Interes Mora</th>
                    <th className="border border-gray-400 p-2">Valor Cobranza</th>
                    <th className="border border-gray-400 p-2">Saldo Capital</th>
                    <th className="border border-gray-400 p-2">PSE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2">{creditoSeleccionado.IdCreditoConvenio}</td>
                    <td className="border border-gray-400 p-2">{creditoSeleccionado.DescripcionPrograma}</td>
                    <td className="border border-gray-400 p-2">${creditoSeleccionado.ValorInteresMora}</td>
                    <td className="border border-gray-400 p-2">${creditoSeleccionado.GastosCobranza}</td>
                    <td className="border border-gray-400 p-2">${creditoSeleccionado.TotalSaldoCapital}</td>
                    <td className="border border-gray-400 p-2">

                      <button onClick={handleGenerarUrlPSE}
                        className={
                          generandoIdPse ? "w-full py-2 rounded-md bg-white-500 font-bold font-medium hover"
                            : "w-full py-2 rounded-md bg-white-500 text-white font-medium hover:bg-gray-200"}
                        disabled={generandoIdPse}>
                        {generandoIdPse ? 'Generando...' : <img src="http://10.0.36.175/Images/pse_logo-02.png" />}

                      </button>

                    </td>
                  </tr>
                </tbody>
              </table>
              {
                <table className="border-collapse border border-gray-400 w-full mt-2">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="border border-gray-400 p-2">N° Cuota</th>
                      <th className="border border-gray-400 p-2">Valor Cuota</th>
                      <th className="border border-gray-400 p-2">Fecha Vencimiento</th>
                      <th className="border border-gray-400 p-2">  </th>

                    </tr>
                  </thead>
                  <tbody>

                    {planCredito.map((item, index) => {

                      return (
                        <tr key={index}>
                          <td className="border border-gray-400 p-2">{item.NumeroCuota}</td>
                          <td className="border border-gray-400 p-2">${item.ValorTotalCuota}</td>
                          <td className="border border-gray-400 p-2">{item.FechaVencimiento}</td>
                          <td className="border border-gray-400 p-2">
                            <input type="checkbox" checked={cuotasSeleccionadas.includes(item)} onChange={() => handleCuotasSeleccionadas(item)} />
                          </td>
                        </tr>
                      )
                    })}

                  </tbody>
                </table>
              }

            </div>}

            <div className="flex items-center mt-2">
              <label style={estiloBadges} htmlFor="" className="w-full text-gray-700 font-medium">
                TOTAL A PAGAR (CUOTAS+GASTOS+MORA) ${totalPagar.toLocaleString("es-ES")}	</label>
            </div>

          </fieldset>
        }

        {
          (cuotasSeleccionadas.length > 0) &&
          <div className="flex items-center py-6">
            <button onClick={handleClickGenerarRecibo}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)} style={isHovered ? estiloHover : estiloBase}
              className={!btnGenerarReciboIsDisabled ? "w-full py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-700" : "w-full py-2 rounded-md bg-gray-500 text-white font-medium hover:bg-blue-700"}
              disabled={btnGenerarReciboIsDisabled}>
              {btnGenerarReciboIsDisabled ? 'Generando...' : 'Generar recibo'}
            </button>
          </div>
        }

      </div>


    </>
  )
}