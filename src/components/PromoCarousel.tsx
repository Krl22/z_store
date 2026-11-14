import { useEffect, useState } from "react";
import type { HomePromo } from "@/lib/types";
import { RemoteImage } from "./ui";

// PromoCarousel(): banner con degradado, avanza solo cada N segundos (store_settings) o al tocarlo.

const FALLBACK_COLORS = ["#234428", "#5F7E3F", "#E7C56B"];

export function PromoCarousel({ promos, rotationSeconds = 4 }: { promos: HomePromo[]; rotationSeconds?: number }) {
  const [index, setIndex] = useState(0);
  const count = promos.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), Math.min(60, Math.max(2, rotationSeconds)) * 1000);
    return () => window.clearTimeout(timer);
  }, [index, count, rotationSeconds]);

  if (count === 0) {
    return (
      <div className="flex h-[142px] flex-col justify-center rounded-[24px] bg-gradient-to-br from-bosque-deep to-store-link p-4 md:h-[240px] md:p-10">
        <p className="text-[22px] font-black text-white">Zeta Dorada</p>
        <p className="text-[13px] text-[#FFF8E8]">Kits de autocultivo y melena de león. Pide por WhatsApp.</p>
      </div>
    );
  }

  const promo = promos[Math.min(index, count - 1)]!;
  const colors = promo.color_hexes.length ? promo.color_hexes : FALLBACK_COLORS;

  return (
    <button
      type="button"
      onClick={() => setIndex((i) => (i + 1) % count)}
      className="flex h-[142px] w-full items-center rounded-[24px] p-4 text-left md:h-[240px] md:rounded-[32px] md:p-10"
      style={{ background: `linear-gradient(135deg, ${colors.join(", ")})` }}
      aria-label={`Anuncio: ${promo.title}`}
    >
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-[12px] font-black text-[#FFF8E8] md:text-[16px]">{promo.eyebrow}</p>
        <p className="line-clamp-2 text-[27px] font-black leading-[29px] text-white md:my-1 md:text-[44px] md:leading-[48px]">{promo.title}</p>
        <p className="truncate text-[12px] text-[#FFF8E8] md:text-[16px]">{promo.detail}</p>
        <div className="mt-2 flex gap-[5px]">
          {promos.map((p, dot) => (
            <span key={p.id} className="h-[7px] rounded-full transition-all" style={{ width: dot === index ? 18 : 7, background: `rgba(255,255,255,${dot === index ? 0.95 : 0.42})` }} />
          ))}
        </div>
      </div>
      <RemoteImage
        url={promo.image_url.trim()}
        alt=""
        background="rgba(255,255,255,0.16)"
        className="size-[104px] shrink-0 rounded-[20px] border border-white/35 md:size-[180px] md:rounded-[28px]"
      />
    </button>
  );
}
