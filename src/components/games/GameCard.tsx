import Link from "next/link";

type Props = Readonly<{
    id: string;
    title: string;
    description: string;
    localPath?: string;
    playUrl?: string | null;
}>;

export default function GameCard({ title, description, localPath, playUrl }: Props) {
    return (
        <div className="rounded-xl border border-white/30 bg-white/95 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white leading-tight">
                {title}
            </h3>
            <p className="mt-2 text-sm text-neutral-700 dark:text-slate-300">{description}</p>

            <div className="mt-4 flex items-center gap-3">
                {playUrl ? (
                    // Playable link opens in new tab for external or local files
                    <a
                        href={playUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-block rounded-full bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                    >
                        Play
                    </a>
                ) : localPath ? (
                    <Link
                        href={`/${localPath}`}
                        className="inline-block rounded-full bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                    >
                        Open folder
                    </Link>
                ) : null}

                {localPath ? (
                    <span className="text-xs text-neutral-500 break-words">{localPath}</span>
                ) : null}
            </div>
        </div>
    );
}
