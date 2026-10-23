export const nyDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: "America/New_York" });

export const addDays = (date: string, n: number) => {
    const d = new Date(`${date}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
};

export const shortDay = (date: string) =>
    new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "numeric", day: "numeric", timeZone: "UTC" });

export const nyHour = (iso: string) =>
    Number(new Date(iso).toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" })) % 24;

export const hourLabel = (h: number) => (h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`);
