import { PaymentElement, useCheckout } from "@stripe/react-stripe-js/checkout";
import { ShippingFormInputs } from "@repo/types";
import { useState } from "react";

const CheckoutForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const checkoutState = useCheckout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  switch (checkoutState.type) {
    case "loading":
      return <div>Loading ...</div>;
    case "error":
      return <div>Error: {checkoutState.error.message}</div>;
    case "success":
      const handleClick = async () => {
        setLoading(true);
        await checkoutState.checkout.updateEmail(shippingForm.email);
        await checkoutState.checkout.updateShippingAddress({
          name: "shipping_address",
          address: {
            line1: shippingForm.address,
            city: shippingForm.city,
            country: "US",
          },
        });
        const result = await checkoutState.checkout.confirm();
        if (result.type === "error") {
          setError(result.error.message);
        }
        setLoading(false);
      };
      return (
        <div>
          {error && <p className="text-red-500">{error}</p>}
          <form>
            <PaymentElement options={{ layout: "accordion" }} />
          </form>
          <button disabled={loading} onClick={handleClick}>
            {loading ? "Loading..." : "Pay"}
          </button>
        </div>
      );
  }
};

export default CheckoutForm;
