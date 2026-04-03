import { useState } from "react";
import { BrowserProvider } from "ethers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { fetchMetaMaskBalance, fetchMetaMaskTransactions } from "@/services/apiClient";
import { toast } from "sonner";

export default function MetaMask() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [txs, setTxs] = useState<
    Array<{ hash: string; from: string; to: string; amount: string; status: string; timestamp?: string }>
  >([]);
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    setBusy(true);
    try {
      const eth = (window as unknown as { ethereum?: { request: (a: { method: string }) => Promise<string[]> } })
        .ethereum;
      if (!eth) {
        toast.error("Install MetaMask to connect");
        return;
      }
      const provider = new BrowserProvider(eth);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      const bal = await fetchMetaMaskBalance(addr);
      setBalance(`${bal.balance} ${bal.currency}`);
      const list = await fetchMetaMaskTransactions(addr);
      setTxs(list);
    } catch (e) {
      toast.error((e as Error).message || "Connection failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1 max-w-3xl mx-auto w-full">
        <h1 className="font-display text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Connect MetaMask to preview balance and demo transaction history (via API mocks).
        </p>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <Button onClick={connect} disabled={busy}>
            {busy ? "Connecting…" : address ? "Reconnect" : "Connect MetaMask"}
          </Button>

          {address && (
            <>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Address</p>
                <p className="font-mono text-sm break-all">{address}</p>
              </div>
              {balance && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Balance (demo)</p>
                  <p className="font-display text-lg font-bold">{balance}</p>
                </div>
              )}
              {txs.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Recent activity</p>
                  <ul className="space-y-3 text-sm">
                    {txs.map((t) => (
                      <li key={t.hash} className="border-t border-border pt-3 first:border-0 first:pt-0">
                        <p className="font-mono text-xs truncate">{t.hash}</p>
                        <p className="text-muted-foreground">
                          {t.amount} ETH · {t.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
