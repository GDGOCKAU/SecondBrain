// A few big, soft, slow orbs behind the network. They drift and shift between the Google colours.
// Kept faint and very blurred so the nodes and links on top stay clear.
const ORBS = [
  { cls: "orb-a left-[-12%] top-[-18%] size-[34vmax]", delay: "0s" },
  { cls: "orb-b right-[-14%] bottom-[-18%] size-[32vmax]", delay: "-17s" },
];

export default function BlurOrbs() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {ORBS.map((o) => (
        <i key={o.cls} className={`orb absolute rounded-full ${o.cls}`} style={{ animationDelay: o.delay }} />
      ))}
    </div>
  );
}
