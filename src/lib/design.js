// ============================================================
// SWASTHYA — Design System
// ============================================================

export const C = {
  saffron:      "#E8650A",
  saffronL:     "#FF8534",
  saffronPale:  "#FFF3EB",
  teal:         "#0A8B7A",
  tealL:        "#12B09C",
  tealPale:     "#E6F7F5",
  navy:         "#0F1D35",
  navyMid:      "#1A2E50",
  navyLight:    "#2E4070",
  cream:        "#FDFAF6",
  warm:         "#F5F0EA",
  white:        "#FFFFFF",
  text:         "#0F1D35",
  textMid:      "#4A5578",
  textLight:    "#9AA3BE",
  border:       "#E8E2D8",
  shadow:       "rgba(15,29,53,0.08)",
  red:          "#D93025",
  redPale:      "#FFF0F0",
  green:        "#2E7D52",
  greenPale:    "#EAF7EE",
  gold:         "#B8860B",
  goldPale:     "#FFF8E1",
  blue:         "#1565C0",
  bluePale:     "#E3F2FD",
};

export const F = {
  // Font sizes
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

// Common reusable style objects
export const btn = {
  primary: {
    border: "none",
    borderRadius: 14,
    background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronL})`,
    color: C.white,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(232,101,10,0.35)",
    padding: "14px 0",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondary: {
    border: `1.5px solid ${C.border}`,
    borderRadius: 14,
    background: C.white,
    color: C.textMid,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "13px 0",
    width: "100%",
  },
  teal: {
    border: "none",
    borderRadius: 14,
    background: `linear-gradient(135deg, ${C.teal}, ${C.tealL})`,
    color: C.white,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(10,139,122,0.35)",
    padding: "14px 0",
    width: "100%",
  },
  danger: {
    border: `1.5px solid ${C.red}`,
    borderRadius: 14,
    background: C.redPale,
    color: C.red,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "13px 0",
    width: "100%",
  },
};

export const card = {
  base: {
    background: C.white,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    boxShadow: `0 2px 12px ${C.shadow}`,
  },
  elevated: {
    background: C.white,
    borderRadius: 18,
    border: `1px solid ${C.border}`,
    boxShadow: `0 4px 20px rgba(15,29,53,0.1)`,
  },
};

export const input = {
  base: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 12,
    border: `1.5px solid ${C.border}`,
    background: C.white,
    fontSize: 15,
    fontWeight: 500,
    color: C.text,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
};

// Page header with back button
export const pageHeaderStyle = {
  background: C.navy,
  padding: "54px 20px 22px",
};

export const backBtnStyle = {
  width: 36, height: 36,
  borderRadius: 18,
  background: "rgba(255,255,255,0.12)",
  border: "none",
  color: C.white,
  fontSize: 18,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
  fontFamily: "inherit",
};
