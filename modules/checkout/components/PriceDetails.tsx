import { FormEvent, useEffect, useState } from 'react';

import { CheckoutToken } from '@chec/commerce.js/types/checkout-token';
import { Live } from '@chec/commerce.js/types/live';
import { useRecoilValue } from 'recoil';

import CartItem from '@/common/components/cart/components/CartItem';
import { commerceJS } from '@/common/lib/commerce';
import cartAtom from '@/common/recoil/cart';

interface Props {
  checkout: CheckoutToken;
  resetCheckout: () => void;
  generating: boolean;
}

const PriceDetails = ({ checkout, resetCheckout, generating }: Props) => {
  const cart = useRecoilValue(cartAtom);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveObject, setLiveObject] = useState<Live>(checkout.live);

  useEffect(() => {
    setLiveObject(checkout.live);
  }, [checkout]);

  useEffect(() => {
    setLoading(generating);
  }, [generating]);

  const handleDiscountCodeEnter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    commerceJS.checkout
      .checkDiscount(checkout.id, { code })
      .then((response) => setLiveObject(response.live))
      .then(() => setLoading(false));
  };

  return (
    <div
      className={`${
        loading && 'pointer-events-none animate-pulse'
      } flex flex-col lg:h-3/4`}
    >
      <h1 className="text-5xl font-bold xl:text-6xl">Products</h1>

      <div className="mb-5 flex flex-1 flex-col gap-5 p-1 lg:overflow-scroll">
        {cart.line_items.map((item) => (
          <CartItem {...item} key={item.id} />
        ))}
      </div>

      <div>
        {!Array.isArray(liveObject.discount) && (
          <>
            <p className="font-semibold">Applied discount code</p>

            <button
              className="block w-max rounded-lg bg-zinc-200 px-2 py-1 font-semibold text-zinc-500 transition-all hover:bg-red-500 hover:text-red-300"
              onClick={resetCheckout}
            >
              {liveObject.discount.code} (-
              {liveObject.discount.type === 'percentage'
                ? `${liveObject.discount.value}%`
                : liveObject.discount.amount_saved.formatted_with_symbol}
              )
            </button>
          </>
        )}
        {Array.isArray(liveObject.discount) && (
          <form
            className="flex w-48 flex-col"
            onSubmit={handleDiscountCodeEnter}
          >
            <label className="font-semibold">Enter discount code</label>
            <div className="flex gap-3">
              <input
                className="w-36 rounded-md border px-2 py-1"
                placeholder="Code..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="btn w-min p-1 px-2" type="submit">
                Check
              </button>
            </div>
          </form>
        )}

        <h2 className="mt-5 text-2xl">
          Total: {liveObject.total.formatted_with_symbol}
        </h2>
      </div>
    </div>
  );
};

export default PriceDetails;