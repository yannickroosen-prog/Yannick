import { describe, expect, it } from "vitest";
import { safeNext, initials, truncate } from "@/lib/utils";
import { renderEmail, escapeHtml } from "@/emails/layout";

describe("safeNext (open redirect)", () => {
  it("laat enkel interne paden toe", () => {
    expect(safeNext("/chat/abc")).toBe("/chat/abc");
    expect(safeNext("https://evil.example")).toBe("/profielen");
    expect(safeNext("//evil.example")).toBe("/profielen");
    expect(safeNext("/\\evil")).toBe("/profielen");
    expect(safeNext(null, "/x")).toBe("/x");
  });
});

describe("initials / truncate", () => {
  it("werkt", () => {
    expect(initials("Ann Van Den Berg")).toBe("AV");
    expect(initials("")).toBe("");
    expect(truncate("abcdef", 4)).toBe("abc…");
    expect(truncate("ab", 4)).toBe("ab");
  });
});

describe("e-mailtemplate", () => {
  it("escapet HTML in gebruikersinhoud", () => {
    const { html, text } = renderEmail({ preheader: "p", title: "<script>x</script>", paragraphs: ['Hallo "Ann" & co'], cta: { label: "Ga", url: "https://app.example/x?a=1&b=2" } }, { siteUrl: "https://app.example" });
    expect(html).not.toContain("<script>x</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;b=2");
    expect(text).toContain("Ga: https://app.example/x?a=1&b=2");
    expect(escapeHtml("<a href='x'>")).toBe("&lt;a href=&#39;x&#39;&gt;");
  });
});
