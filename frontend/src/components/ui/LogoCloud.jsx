import rapidoWordmark from "../../assets/logo/rapido-wordmark-cropped.png";
import rapidoIcon from "../../assets/logo/rapido-icon-cropped.png";

export default function LogoCloud() {
  return (
    <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <img
          src={rapidoWordmark}
          alt="Rapido Solutions Co. full logo"
          className="mx-auto h-auto max-h-36 w-full object-contain"
        />
      </div>
      <div className="grid place-items-center rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <img src={rapidoIcon} alt="Rapido icon logo" className="h-32 w-32 rounded-lg object-contain" />
      </div>
    </div>
  );
}
