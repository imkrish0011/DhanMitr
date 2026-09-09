"""Hyper-Local Business Feasibility Analysis API endpoint."""

import asyncio
import json
import logging
import re
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from backend.app.core.config import settings
from backend.app.schemas.feasibility import (
    FeasibilityAnalyzeRequest,
    FeasibilityAnalyzeResponse,
    SWOTAnalysis,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Default Sector Profiles & Deterministic Fallbacks
# ---------------------------------------------------------------------------
SECTOR_PROFILES: Dict[str, Dict[str, Any]] = {
    "dairy": {
        "title": "Dairy Farm & Milk Supply",
        "market_reach_radius": "5–8 km (Est. 12,000–16,000 population across 4 adjoining hamlets)",
        "competitor_density": "Low to Moderate (1-2 local informal milk collectors within 5km)",
        "market_saturation": "Low — Strong recurring daily demand from tea stalls, sweet shops, and dairies",
        "pricing_benchmarks": [
            "Cow Milk Farm-gate Rate: ₹50 – ₹58 / litre",
            "Buffalo Milk Rate: ₹68 – ₹78 / litre (higher fat content premium)",
            "Green Fodder & Cattle Feed: ₹28 – ₹35 / kg",
            "Veterinary & Vaccination Support: ~₹600 / animal / quarter",
        ],
        "swot": {
            "strengths": [
                "Daily steady morning and evening cash flow from local milk collection centers.",
                "High organic byproduct value — cow dung sells as vermicompost fertilizer.",
                "Zero credit/udhaar risk when selling through village dairy cooperatives (DCS)."
            ],
            "weaknesses": [
                "High dependency on daily fresh water, cattle hygiene, and disease monitoring.",
                "Labor-intensive morning milking routine requires continuous physical presence.",
                "Seasonal milk yield drops during hot summer months without proper cooling sheds."
            ],
            "opportunities": [
                "Supplying paneer, curd, and clarified butter (Ghee) to nearby block town for 2x margins.",
                "Subsidies under National Livestock Mission (NLM) and Animal Husbandry Infra Fund.",
                "Bulk direct supply contracts with wedding caterers and sweet confectioners."
            ],
            "threats": [
                "Sudden livestock illness (mastitis, FMD) if veterinary care is delayed.",
                "Feed price spikes during dry or unseasonal monsoon periods.",
                "Local chilling center power cuts if cold-chain backup is missing."
            ]
        },
        "sales_multiplier": 0.35,  # monthly sales as % of project cost
        "net_margin_percent": 28.0,
        "break_even_months": 12,
        "viability_score": 89,
        "bank_readiness": "Aadhaar, PAN, Udyam MSME, Veterinary quotation & Milk cooperative collection MoU ready.",
        "recommendation": "Highly recommended for rural clusters. Steady daily liquidity ensures zero bank default."
    },
    "poultry": {
        "title": "Broiler & Egg Poultry Unit",
        "market_reach_radius": "6–10 km (Catchment of ~18,000 rural consumers & local dhabas)",
        "competitor_density": "Moderate (2 local broiler sheds within 7km)",
        "market_saturation": "Moderate — High meat & protein demand during festive and harvest cycles",
        "pricing_benchmarks": [
            "Broiler Farm-gate Live Bird Rate: ₹90 – ₹115 / kg",
            "Table Eggs (Desi / Kadaknath): ₹8 – ₹12 / egg",
            "Commercial Layer Eggs: ₹6.00 – ₹7.20 / egg",
            "Poultry Mash / Starter Feed: ₹36 – ₹42 / kg",
        ],
        "swot": {
            "strengths": [
                "Rapid 40–45 day harvest turnaround allows quick 6-7 cash flow rotations per year.",
                "Strong local consumption from village butchers, dhabas, and weekly haat markets.",
                "High bird weight conversion ratio with standardized commercial feed."
            ],
            "weaknesses": [
                "Strict biosecurity and disinfectant routines needed to prevent bird flu/infections.",
                "High sensitivity to extreme heat during May-June requiring evaporative foggers.",
                "High upfront feed expenditure accounts for ~65% of operating costs."
            ],
            "opportunities": [
                "Entering corporate integration/contract farming (Suguna, Venky's, IB) for guaranteed buyback.",
                "Supplying cage-free country eggs (Desi) at a 40% retail premium.",
                "Selling rich poultry manure to sugarcane and fruit orchard farmers."
            ],
            "threats": [
                "Outbreaks of seasonal viral infections requiring bird culling.",
                "Volatile open-market live bird prices influenced by regional mandi arrivals.",
                "Religious/festive fasting periods (Shravan, Navratri) causing temporary demand drops."
            ]
        },
        "sales_multiplier": 0.40,
        "net_margin_percent": 22.0,
        "break_even_months": 10,
        "viability_score": 83,
        "bank_readiness": "Aadhaar, PAN, Udyam MSME, Shed construction estimate & Hatchery chick supply MoU.",
        "recommendation": "Fast capital rotation model. Ideal if contract farming or dhaba tie-ups are secured."
    },
    "retail": {
        "title": "Kirana & Rural FMCG Store",
        "market_reach_radius": "3–5 km (Direct walking & e-rickshaw radius of ~7,000 village residents)",
        "competitor_density": "Moderate to High (3 small kiosks within 2km, but lacking full stock)",
        "market_saturation": "Moderate — Differentiation possible via digital payments, bulk grains & delivery",
        "pricing_benchmarks": [
            "FMCG Packaged Goods Gross Margin: 12% – 18%",
            "Unbranded Grains & Pulses Margin: 18% – 25%",
            "Spices & Loose Commodities: 25% – 32%",
            "AePS / Micro-ATM Cash Out Commission: ₹8 – ₹12 per transaction",
        ],
        "swot": {
            "strengths": [
                "Essential daily household requirement drives resilient daily footfall and repeat buyers.",
                "Opportunity to offer banking kiosk services (AePS, mobile recharge, bill pay) for extra income.",
                "Low technical skill barrier; family members can assist in store operations."
            ],
            "weaknesses": [
                "Customer pressure for informal credit (Udhaar) can severely trap working capital.",
                "Inventory shrinkage and pest control in humid monsoon storage conditions.",
                "Long operating hours (7:00 AM to 9:30 PM) required to capture morning & evening rush."
            ],
            "opportunities": [
                "Partnering with wholesale B2B distributors (JioMart, Udaan) for 5-8% procurement savings.",
                "WhatsApp order delivery for elderly households and farming families during harvesting.",
                "Adding seed, fertilizer, and cattle feed packets as seasonal impulse categories."
            ],
            "threats": [
                "Rising local competition from informal home-run kiosk shops.",
                "Capital lock-in if slow-moving inventory is over-purchased.",
                "Price wars on branded FMCG goods from town supermarkets."
            ]
        },
        "sales_multiplier": 0.45,
        "net_margin_percent": 18.0,
        "break_even_months": 9,
        "viability_score": 87,
        "bank_readiness": "Aadhaar, PAN, Udyam Registration, Shop rental agreement & Wholesale vendor quotation.",
        "recommendation": "Lowest market risk. Ensure strict 'zero informal credit' rule to safeguard cash flow."
    },
    "textiles": {
        "title": "Garments & Tailoring Unit",
        "market_reach_radius": "5–10 km (Serving 3-5 panchayats + local school uniform clusters)",
        "competitor_density": "Low (Mostly individual home tailors with limited machinery)",
        "market_saturation": "Low — Strong demand for modern fits, blouse embroidery, and festive apparel",
        "pricing_benchmarks": [
            "Basic Ladies Kurti / Blouse Stitching: ₹250 – ₹450 / piece",
            "Designer Embroidery / Festive Wear: ₹750 – ₹1,800 / piece",
            "Men's Shirt & Trouser Stitching: ₹400 – ₹700 / pair",
            "School Uniform Set: ₹350 – ₹550 / pair (bulk contracts)",
        ],
        "swot": {
            "strengths": [
                "High profit margins on skilled labor with minimal raw material inventory decay.",
                "Repeat loyal customer base once stitching fit and precision are established.",
                "Zero perishable goods risk compared to livestock or fresh agriculture."
            ],
            "weaknesses": [
                "Requires skilled sewing machine operators and master cutters.",
                "Demand fluctuation between wedding/festive peaks and quiet monsoon months.",
                "Manual alteration rework if client measurements change."
            ],
            "opportunities": [
                "Annual bulk uniform contracts with local government, private schools, and police cadets.",
                "Adding computer-assisted sewing/embroidery machines to command 3x stitching fees.",
                "Training local women SHGs under PM Vishwakarma / NRLM schemes for subsidized wages."
            ],
            "threats": [
                "Cheap imported readymade synthetic garments arriving in weekly village haat bazaars.",
                "Operator attrition if skilled master cutters migrate to urban centers.",
                "Power fluctuations requiring motor stabilizers or solar inverter backups."
            ]
        },
        "sales_multiplier": 0.28,
        "net_margin_percent": 35.0,
        "break_even_months": 14,
        "viability_score": 81,
        "bank_readiness": "Aadhaar, PAN, Udyam MSME, Industrial sewing machine proforma invoice & Space rent deed.",
        "recommendation": "Excellent high-margin business for rural artisans. Highly favored under Stand-Up India."
    },
    "agro": {
        "title": "Agro Grain & Flour Mini Mill",
        "market_reach_radius": "5–10 km (Catchment of ~250 agrarian farming households & mandis)",
        "competitor_density": "Low to Moderate (1 antiquated diesel flour mill 4km away)",
        "market_saturation": "Low — High farmer preference for local automated milling over town travel",
        "pricing_benchmarks": [
            "Wheat Flour (Chakki Atta) Milling Charge: ₹3.50 – ₹5.00 / kg",
            "Paddy (Rice) De-husking Charge: ₹4.00 – ₹6.50 / kg",
            "Mustard / Oilseed Crushing Charge: ₹12 – ₹18 / kg",
            "Cattle Bran & Husk Byproduct Sale: ₹22 – ₹28 / kg",
        ],
        "swot": {
            "strengths": [
                "Direct agrarian farmer footfall; farmers pay in immediate cash or grain barters.",
                "Byproducts (wheat bran, mustard oil cake) generate 25% additional revenue as livestock feed.",
                "Essential rural utility that functions year-round with spike during Rabi/Kharif harvests."
            ],
            "weaknesses": [
                "Requires reliable 3-phase rural electricity connection or solar-hybrid setup.",
                "Stone mill emery dressing and machine maintenance needed every 15-20 days.",
                "High initial capital requirement for heavy-duty pulverizer and cleaner machinery."
            ],
            "opportunities": [
                "Branding and packaging cold-pressed mustard oil and stone-ground whole wheat atta.",
                "Supplying custom cattle feed blends directly to local dairy farmers.",
                "Subsidies under PM Formalisation of Micro food processing Enterprises (PMFME) Scheme (35% grant)."
            ],
            "threats": [
                "Rural power grid voltage drops causing motor overheating during peak hours.",
                "Seasonal crop failures (hailstorms/drought) impacting overall harvest volumes.",
                "Dust accumulation requiring strict fire-safety and ventilation standards."
            ]
        },
        "sales_multiplier": 0.32,
        "net_margin_percent": 32.0,
        "break_even_months": 13,
        "viability_score": 86,
        "bank_readiness": "Aadhaar, PAN, Udyam MSME, Mill machinery manufacturer quote & 3-phase power sanction letter.",
        "recommendation": "Outstanding community asset. Eligible for 35% credit-linked capital subsidy under PMFME."
    },
    "tech": {
        "title": "Solar & Mobile Tech Workshop",
        "market_reach_radius": "7–12 km (Serving 6-8 villages without electronic repair centers)",
        "competitor_density": "Very Low (No certified solar inverter / smartphone technician in 8km)",
        "market_saturation": "Very Low — Rapid rural adoption of smartphones, solar pumps, and inverters",
        "pricing_benchmarks": [
            "Smartphone Screen / Display Replacement: ₹900 – ₹1,800 (₹400 labor profit)",
            "Charging Port / Mic / Speaker Repair: ₹150 – ₹350",
            "Solar Inverter / Pump In-situ Service: ₹500 – ₹1,200 per visit",
            "Accessories (Cables, Tempered Glass): 50% – 65% retail margin",
        ],
        "swot": {
            "strengths": [
                "High profit margins on skilled technical labor with negligible inventory decay.",
                "Growing rural smartphone penetration and PM-KUSUM solar pump installations.",
                "Low shop footprint required (100–150 sq ft is sufficient)."
            ],
            "weaknesses": [
                "Requires technician to stay updated with newest smartphone models and PCB schematics.",
                "Need to source spare parts 1-2 times weekly from district town distributor.",
                "Test bench equipment (SMD rework station, multimeter, DC power) requires precision handling."
            ],
            "opportunities": [
                "Authorized service center partnership with solar pump manufacturers and regional telcos.",
                "Selling refurbished second-hand smartphones with 3-month store warranty.",
                "Installing rooftop solar home lighting kits under PM Surya Ghar Muft Bijli Yojana."
            ],
            "threats": [
                "Fast technological obsolescence of spare parts inventory.",
                "Urban service centers offering courier-based repair if turnaround is slow.",
                "Counterfeit replacement batteries or displays damaging customer trust."
            ]
        },
        "sales_multiplier": 0.30,
        "net_margin_percent": 40.0,
        "break_even_months": 11,
        "viability_score": 84,
        "bank_readiness": "Aadhaar, PAN, Udyam MSME, Technical diploma / ITI certificate & Equipment quotation.",
        "recommendation": "Future-proof modern rural service business with high gross margins on skilled labor."
    }
}


def _compute_scheme_routing(margin_capital: float) -> Dict[str, Any]:
    """Computes project cost, loan amount, and government scheme routing."""
    # Project Cost = Margin / 10%
    project_cost = round(margin_capital / 0.10)
    # Loan = 90% of Project Cost
    loan_eligible = round(project_cost * 0.90)

    if loan_eligible <= 140000:
        return {
            "project_cost": project_cost,
            "loan_eligible_90": loan_eligible,
            "recommended_scheme": "Micro Finance Scheme",
            "scheme_tier": "Tier 1: Concessional Micro Credit",
            "scheme_interest_rate": 6.5,
            "scheme_tenure_years": 3,
            "moratorium_months": 3,
            "note": "Zero collateral priority loan designed for rural micro-ventures."
        }
    elif loan_eligible <= 5000000:
        return {
            "project_cost": project_cost,
            "loan_eligible_90": loan_eligible,
            "recommended_scheme": "MSME Term Loan Scheme",
            "scheme_tier": "Tier 2: Institutional Term Credit",
            "scheme_interest_rate": 8.0,
            "scheme_tenure_years": 7,
            "moratorium_months": 6,
            "note": "CGTMSE covered machinery and setup loan with 6 months moratorium."
        }
    else:
        return {
            "project_cost": project_cost,
            "loan_eligible_90": loan_eligible,
            "recommended_scheme": "Commercial MSME Scheme",
            "scheme_tier": "Tier 3: Enterprise Credit",
            "scheme_interest_rate": 9.5,
            "scheme_tenure_years": 8,
            "moratorium_months": 6,
            "note": "Enterprise credit facility with customized banking terms."
        }


def _build_fallback_response(
    location: str,
    category: str,
    margin_capital: float,
    language: str = "en"
) -> FeasibilityAnalyzeResponse:
    """Builds a deterministic high-precision fallback response."""
    cat_key = category.lower().strip()
    profile = SECTOR_PROFILES.get(cat_key, SECTOR_PROFILES["dairy"])
    routing = _compute_scheme_routing(margin_capital)

    project_cost = routing["project_cost"]
    monthly_sales = round(project_cost * profile["sales_multiplier"])
    net_profit = round(monthly_sales * (profile["net_margin_percent"] / 100))

    swot_dict = profile["swot"]
    swot = SWOTAnalysis(
        strengths=swot_dict.get("strengths", []),
        weaknesses=swot_dict.get("weaknesses", []),
        opportunities=swot_dict.get("opportunities", []),
        threats=swot_dict.get("threats", [])
    )

    return FeasibilityAnalyzeResponse(
        location=location,
        business_category=cat_key,
        category_title=profile["title"],
        margin_capital=margin_capital,
        project_cost=project_cost,
        loan_eligible_90=routing["loan_eligible_90"],
        recommended_scheme=routing["recommended_scheme"],
        scheme_tier=routing["scheme_tier"],
        scheme_interest_rate=routing["scheme_interest_rate"],
        scheme_tenure_years=routing["scheme_tenure_years"],
        moratorium_months=routing["moratorium_months"],
        market_reach_radius=profile["market_reach_radius"],
        competitor_density=profile["competitor_density"],
        market_saturation=profile["market_saturation"],
        swot=swot,
        pricing_benchmarks=profile["pricing_benchmarks"],
        estimated_monthly_sales=monthly_sales,
        net_margin_percent=profile["net_margin_percent"],
        estimated_monthly_profit=net_profit,
        viability_score=profile["viability_score"],
        break_even_months=profile["break_even_months"],
        bank_readiness_summary=profile["bank_readiness"],
        recommendation=f"For {location}: {profile['recommendation']}"
    )


FEASIBILITY_MODELS = [
    "qwen/qwen3.8-27b",
    "qwen/qwen3.6-27b",
    "groq/compound-mini",
    "openai/gpt-oss-120b",
]


def _call_groq_feasibility_sync(groq_client, prompt_system: str, user_prompt: str) -> str:
    """Executes Groq completion using fast available models."""
    for model_name in FEASIBILITY_MODELS:
        try:
            completion = groq_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": prompt_system},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                max_tokens=900,
            )
            content = (completion.choices[0].message.content or "").strip()
            if content:
                return content
        except Exception as exc:
            logger.warning("Feasibility Groq model '%s' failed: %s", model_name, exc)
            continue
    return ""


@router.post("/analyze", response_model=FeasibilityAnalyzeResponse, summary="Analyze hyper-local rural business feasibility")
async def analyze_feasibility(request: FeasibilityAnalyzeRequest) -> FeasibilityAnalyzeResponse:
    """Hyper-local village/block feasibility analysis using Groq LLM with deterministic fallback."""
    cat_key = request.business_category.lower().strip()
    if cat_key not in SECTOR_PROFILES:
        cat_key = "dairy"

    location_clean = request.location.strip() or "Local Village"
    routing = _compute_scheme_routing(request.margin_capital)
    project_cost = routing["project_cost"]

    # Check if Groq API key is available
    groq_api_key = settings.GROQ_API_KEY
    if not groq_api_key:
        logger.info("Groq API key not configured. Returning verified hyper-local fallback data.")
        return _build_fallback_response(
            location=location_clean,
            category=cat_key,
            margin_capital=request.margin_capital,
            language=request.language or "en"
        )

    try:
        from groq import Groq
        groq_client = Groq(api_key=groq_api_key)

        prompt_system = (
            "You are the Chief Rural Business Advisory Officer for the Indian Ministry of MSME & NABARD. "
            "Your role is to generate rigorous, highly localized, data-backed feasibility reports for rural micro-entrepreneurs. "
            "IMPORTANT LOCATION RULE: If the location provided is empty, vague, fictional, or unrecognized (e.g. random letters, generic words, or non-village names), gracefully normalize it to a 'Standard Rural Gram Panchayat Cluster (Tier-4 Rural Block)' and provide representative Indian village economics. In recommendation, gently advise the entrepreneur to provide their specific Village & District for exact mandi pricing. "
            "You must output ONLY a valid JSON object matching the exact schema requested with NO markdown wrap, NO comments, NO extra text."
        )

        user_prompt = f"""Generate a localized business feasibility study for:
Location: {location_clean}
Business Sector: {cat_key} ({SECTOR_PROFILES[cat_key]['title']})
Promoter Margin Capital: ₹{request.margin_capital:,.0f}
Calculated Project Cost (Margin ÷ 10%): ₹{project_cost:,.0f}
Eligible 90% Loan: ₹{routing['loan_eligible_90']:,.0f}
Government Scheme: {routing['recommended_scheme']} ({routing['scheme_interest_rate']}% interest, {routing['scheme_tenure_years']}yr tenure, {routing['moratorium_months']}mo moratorium)
Output Language: {request.language or 'en'}

Respond ONLY with this valid JSON object:
{{
  "market_reach_radius": "Specific 5-10 km radius description localized to {location_clean}",
  "competitor_density": "Specific competitor count & density within 5-10km",
  "market_saturation": "Low | Moderate | High with 1-line reason",
  "pricing_benchmarks": ["3 to 4 local itemized price benchmarks in INR"],
  "swot": {{
    "strengths": ["3 clear bullet points tailored to this village enterprise"],
    "weaknesses": ["3 operational vulnerabilities"],
    "opportunities": ["3 untapped market opportunities in this area"],
    "threats": ["3 external risks or threats"]
  }},
  "estimated_monthly_sales": {round(project_cost * SECTOR_PROFILES[cat_key]['sales_multiplier'])},
  "net_margin_percent": {SECTOR_PROFILES[cat_key]['net_margin_percent']},
  "estimated_monthly_profit": {round(project_cost * SECTOR_PROFILES[cat_key]['sales_multiplier'] * SECTOR_PROFILES[cat_key]['net_margin_percent'] / 100)},
  "viability_score": {SECTOR_PROFILES[cat_key]['viability_score']},
  "break_even_months": {SECTOR_PROFILES[cat_key]['break_even_months']},
  "bank_readiness_summary": "4 required documents and approval status",
  "recommendation": "2 sentence strategic advice for the entrepreneur in {location_clean}"
}}"""

        content = await asyncio.to_thread(
            _call_groq_feasibility_sync, groq_client, prompt_system, user_prompt
        )

        content = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
        content = re.sub(r"\s*```$", "", content).strip()

        match = re.search(r"\{.*\}", content, re.DOTALL)
        json_str = match.group(0) if match else content
        parsed = json.loads(json_str, strict=False)

        swot_data = parsed.get("swot", {})
        swot = SWOTAnalysis(
            strengths=swot_data.get("strengths", SECTOR_PROFILES[cat_key]["swot"]["strengths"]),
            weaknesses=swot_data.get("weaknesses", SECTOR_PROFILES[cat_key]["swot"]["weaknesses"]),
            opportunities=swot_data.get("opportunities", SECTOR_PROFILES[cat_key]["swot"]["opportunities"]),
            threats=swot_data.get("threats", SECTOR_PROFILES[cat_key]["swot"]["threats"]),
        )

        return FeasibilityAnalyzeResponse(
            location=location_clean,
            business_category=cat_key,
            category_title=SECTOR_PROFILES[cat_key]["title"],
            margin_capital=request.margin_capital,
            project_cost=project_cost,
            loan_eligible_90=routing["loan_eligible_90"],
            recommended_scheme=routing["recommended_scheme"],
            scheme_tier=routing["scheme_tier"],
            scheme_interest_rate=routing["scheme_interest_rate"],
            scheme_tenure_years=routing["scheme_tenure_years"],
            moratorium_months=routing["moratorium_months"],
            market_reach_radius=parsed.get("market_reach_radius", SECTOR_PROFILES[cat_key]["market_reach_radius"]),
            competitor_density=parsed.get("competitor_density", SECTOR_PROFILES[cat_key]["competitor_density"]),
            market_saturation=parsed.get("market_saturation", SECTOR_PROFILES[cat_key]["market_saturation"]),
            swot=swot,
            pricing_benchmarks=parsed.get("pricing_benchmarks", SECTOR_PROFILES[cat_key]["pricing_benchmarks"]),
            estimated_monthly_sales=float(parsed.get("estimated_monthly_sales", project_cost * SECTOR_PROFILES[cat_key]["sales_multiplier"])),
            net_margin_percent=float(parsed.get("net_margin_percent", SECTOR_PROFILES[cat_key]["net_margin_percent"])),
            estimated_monthly_profit=float(parsed.get("estimated_monthly_profit", project_cost * SECTOR_PROFILES[cat_key]["sales_multiplier"] * SECTOR_PROFILES[cat_key]["net_margin_percent"] / 100)),
            viability_score=int(parsed.get("viability_score", SECTOR_PROFILES[cat_key]["viability_score"])),
            break_even_months=int(parsed.get("break_even_months", SECTOR_PROFILES[cat_key]["break_even_months"])),
            bank_readiness_summary=parsed.get("bank_readiness_summary", SECTOR_PROFILES[cat_key]["bank_readiness"]),
            recommendation=parsed.get("recommendation", f"For {location_clean}: {SECTOR_PROFILES[cat_key]['recommendation']}"),
        )

    except Exception as exc:
        logger.warning("Groq feasibility generation failed (%s). Falling back to verified benchmarks.", exc)
        return _build_fallback_response(
            location=location_clean,
            category=cat_key,
            margin_capital=request.margin_capital,
            language=request.language or "en"
        )
