import Swal from "sweetalert2";

export const mostrarAlertaError = (mensaje = '',duracionMilisegundo=5000) => {
    //MUESTRO ALERTA DE FALLO
    Swal.fire({
        icon: "error",
        title: `<h2>${mensaje}</h2>`,
        timer: duracionMilisegundo,
      })
}

export const mostrarAlertaExito = (mensaje = '',duracionMilisegundo=5000) => {
    //MUESTRO ALERTA DE EXITO 
    Swal.fire({
        icon: "success",
        title: `<h2>${mensaje}</h2>`,
        timer: duracionMilisegundo,
    });
}

export const mostrarAlertaExitoSinTimer = (mensaje = '',duracionMilisegundo=5000) => {
    //MUESTRO ALERTA DE EXITO 
    Swal.fire({
        icon: "success",
        title: `<h2>${mensaje}</h2>`,
        //timer: duracionMilisegundo,
    });
}

export const mostrarAlertaFalloSinTimer = (mensaje = '',duracionMilisegundo=5000) => {
    //MUESTRO ALERTA DE EXITO 
    Swal.fire({
        icon: "error",
        title: `<h2>${mensaje}</h2>`,
        //timer: duracionMilisegundo,
    });
}

export const mostrarAlertaConfirmacion = (mensaje="",textoBoton="") => {
    return Swal.fire({
        //title: mensaje,//"Seguro deseas eliminar?",
        //text: mensaje,
        html:mensaje,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#151b60",//"#2C3A49",//"#3085d6",
        cancelButtonText:"Cancelar",
        cancelButtonColor: "#779B00", //"#d33",
        confirmButtonText: textoBoton//"Si elimiminar"
      });
}