import Swal, { SweetAlertIcon, SweetAlertPosition } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const ShowAlert = (
  title: string,
  icon: SweetAlertIcon = "success",
  position: SweetAlertPosition = "top-end",
  callback?: () => void
) => {
  MySwal.fire({
    theme: "dark",
    position,
    title,
    icon,
    width: 300,
    showConfirmButton: false,
    timer: 1500,
    customClass: {
      popup: "z-150",
    },
  }).then((result) => {
    if (result.isConfirmed && callback) {
      callback();
    }
  });
};
