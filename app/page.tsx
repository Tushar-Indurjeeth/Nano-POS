import CashierView from "./components/CashierView";
import SalesView from "./components/SalesView";

export default function Home() {
  return (
    <main className="p-4 max-h-screen">
      <h1 className="text-3xl font-bold mb-4">Nano POS</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <CashierView />
        </div>
        <div>
          <SalesView />
        </div>
      </div>
    </main>
  );
}
