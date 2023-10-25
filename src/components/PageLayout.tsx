import type { PropsWithChildren } from "react";

function PageLayout(props: PropsWithChildren) {
  return (
    <main className="flex min-h-screen justify-center overflow-y-auto">
      <div className="w-full  border-x border-slate-400 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
}

export default PageLayout;
