--
-- PostgreSQL database dump
--

\restrict enPpflV9Eh4V6eyt8DrRdG5BLpGyxLO6ofNpw7GzXIS1gt2EOBfmovhLCmg6Zx0

-- Dumped from database version 18.1 (Homebrew)
-- Dumped by pg_dump version 18.1 (Homebrew)

-- Started on 2026-03-08 14:07:25 +07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 36371)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 3937 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 860 (class 1247 OID 36373)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'LEADER',
    'MEMBER'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 36422)
-- Name: Activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Activity" (
    id text NOT NULL,
    name text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    category text NOT NULL,
    location text,
    notes text,
    "tripId" text NOT NULL
);


ALTER TABLE public."Activity" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 36436)
-- Name: Expense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'THB'::text NOT NULL,
    "thbAmount" integer DEFAULT 0 NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tripId" text NOT NULL,
    "activityId" text,
    "payerId" text NOT NULL
);


ALTER TABLE public."Expense" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 36456)
-- Name: ExpenseParticipant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ExpenseParticipant" (
    id text NOT NULL,
    "expenseId" text NOT NULL,
    "memberId" text NOT NULL,
    share integer NOT NULL
);


ALTER TABLE public."ExpenseParticipant" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 36410)
-- Name: Member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Member" (
    id text NOT NULL,
    name text NOT NULL,
    "tripId" text NOT NULL,
    role public."Role" DEFAULT 'MEMBER'::public."Role" NOT NULL
);


ALTER TABLE public."Member" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 36485)
-- Name: SavedContact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SavedContact" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SavedContact" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 36467)
-- Name: Settlement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Settlement" (
    id text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'THB'::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tripId" text NOT NULL,
    "debtorId" text NOT NULL,
    "creditorId" text NOT NULL,
    "slipUrl" text
);


ALTER TABLE public."Settlement" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 36390)
-- Name: Trip; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Trip" (
    id text NOT NULL,
    name text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    timezone text DEFAULT 'Asia/Bangkok'::text NOT NULL,
    budget integer DEFAULT 0 NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text,
    "coverImage" text,
    "userId" text
);


ALTER TABLE public."Trip" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 36496)
-- Name: TripImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TripImage" (
    id text NOT NULL,
    url text NOT NULL,
    caption text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tripId" text NOT NULL
);


ALTER TABLE public."TripImage" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 36377)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    username text NOT NULL,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 3926 (class 0 OID 36422)
-- Dependencies: 222
-- Data for Name: Activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Activity" (id, name, date, "startTime", "endTime", category, location, notes, "tripId") FROM stdin;
cmmh69sfv0006cft5rsgwhx5p	ถึงสนามบินนาริตะ	2026-04-09 00:00:00	2026-04-08 23:00:00	2026-04-09 00:30:00	transport	Narita International Airport	ผ่านตม. รับกระเป๋า ซื้อ Suica Card	cmmh69sfp0001cft5hn9awvu5
cmmh69sfv0007cft541ubaar3	เช็คอินโรงแรม Shinjuku	2026-04-09 00:00:00	2026-04-09 02:00:00	2026-04-09 03:00:00	accommodation	Shinjuku Granbell Hotel	ฝากกระเป๋าก่อน เช็คอินจริง 15:00	cmmh69sfp0001cft5hn9awvu5
cmmh69sfv0008cft5y4aiyzcj	กินราเม็ง Fuunji	2026-04-09 00:00:00	2026-04-09 03:00:00	2026-04-09 04:00:00	food	Fuunji Ramen, Shinjuku	ราเม็งแบบ tsukemen ร้านดัง ต่อคิว 20 นาที	cmmh69sfp0001cft5hn9awvu5
cmmh69sfv0009cft50ujrnc2e	ช้อปปิ้งชินจูกุ	2026-04-09 00:00:00	2026-04-09 04:30:00	2026-04-09 07:00:00	shopping	Shinjuku, Tokyo	Don Quijote, Kabukicho, Uniqlo	cmmh69sfp0001cft5hn9awvu5
cmmh69sfv000acft515s6h3i1	ชมซากุระ สวนชินจูกุเกียวเอ็น	2026-04-09 00:00:00	2026-04-09 07:00:00	2026-04-09 09:00:00	attraction	Shinjuku Gyoen National Garden	ค่าเข้า 500 เยนต่อคน ถ่ายรูปซากุระ	cmmh69sfp0001cft5hn9awvu5
cmmh69sfv000bcft5v3oxjd7i	อิซากายะ โอโมอิเดะ โยโกโจ	2026-04-09 00:00:00	2026-04-09 09:30:00	2026-04-09 11:30:00	food	Omoide Yokocho, Shinjuku	ยากิโทริ + เบียร์สด	cmmh69sfp0001cft5hn9awvu5
cmmh69sfz000ccft58l18phd6	ซูชิเช้าที่ตลาด Toyosu	2026-04-10 00:00:00	2026-04-09 21:30:00	2026-04-10 00:00:00	food	Toyosu Fish Market	กินซูชิสดๆ ดูประมูลทูน่ายักษ์	cmmh69sfp0001cft5hn9awvu5
cmmh69sfz000dcft5s0y5c0fv	เที่ยววัดเซ็นโซจิ	2026-04-10 00:00:00	2026-04-10 01:00:00	2026-04-10 03:00:00	attraction	Senso-ji Temple, Asakusa	เดินถนน Nakamise ซื้อของฝาก	cmmh69sfp0001cft5hn9awvu5
cmmh69sfz000ecft55mcym1q0	กินโมนจายากิ Sometaro	2026-04-10 00:00:00	2026-04-10 03:30:00	2026-04-10 04:30:00	food	Sometaro, Asakusa	ร้าน DIY โมนจายากิ สนุกสุดๆ	cmmh69sfp0001cft5hn9awvu5
cmmh69sfz000fcft5vv8rmrh8	ช้อปปิ้ง Akihabara	2026-04-10 00:00:00	2026-04-10 05:00:00	2026-04-10 08:00:00	shopping	Akihabara, Tokyo	ร้านการ์ดเกม, Yodobashi Camera	cmmh69sfp0001cft5hn9awvu5
cmmh69sfz000gcft5la8lu9q6	ชมวิว Tokyo Skytree	2026-04-10 00:00:00	2026-04-10 09:00:00	2026-04-10 11:00:00	attraction	Tokyo Skytree	ชมวิว sunset ค่าเข้า 2,100 เยน	cmmh69sfp0001cft5hn9awvu5
cmmh69sfz000hcft5hy757b8w	ทงคัตสึ Maisen	2026-04-10 00:00:00	2026-04-10 11:30:00	2026-04-10 12:30:00	food	Maisen Tonkatsu, Omotesando	หมูทอดระดับตำนาน	cmmh69sfp0001cft5hn9awvu5
cmmh69sg2000icft5yhrml845	ศาลเจ้าเมจิ + ป่ากลางกรุง	2026-04-11 00:00:00	2026-04-10 23:00:00	2026-04-11 00:30:00	attraction	Meiji Jingu Shrine	\N	cmmh69sfp0001cft5hn9awvu5
cmmh69sg2000jcft5kk9kzv45	ช้อปปิ้ง Harajuku	2026-04-11 00:00:00	2026-04-11 01:00:00	2026-04-11 03:00:00	shopping	Takeshita Street, Harajuku	เครปญี่ปุ่น แฟชั่น street	cmmh69sfp0001cft5hn9awvu5
cmmh69sg2000kcft51msk3rte	เช็คเอาท์ + Narita Express	2026-04-11 00:00:00	2026-04-11 04:00:00	2026-04-11 07:30:00	transport	Narita Express (N'EX)	รถไฟ 60 นาทีถึงสนามบิน	cmmh69sfp0001cft5hn9awvu5
cmmh69sg2000lcft5v9or92ca	ช้อปปิ้ง Duty Free	2026-04-11 00:00:00	2026-04-11 08:00:00	2026-04-11 10:00:00	shopping	Narita Airport Terminal 1	Tokyo Banana, Royce	cmmh69sfp0001cft5hn9awvu5
cmmh69sh20024cft50vg0ez8p	ถึง CNX + รับรถเช่า	2026-11-01 00:00:00	2026-11-01 02:00:00	2026-11-01 03:00:00	transport	Chiang Mai Airport	Honda Jazz ออโต้	cmmh69sgz0020cft5ikackd33
cmmh69sh20025cft58kn4bnx1	เช็คอิน At Nimman	2026-11-01 00:00:00	2026-11-01 03:30:00	2026-11-01 04:00:00	accommodation	At Nimman Hotel	\N	cmmh69sgz0020cft5ikackd33
cmmh69sh20026cft5bd8ve1rg	ข้าวซอย ขุนยะ	2026-11-01 00:00:00	2026-11-01 04:30:00	2026-11-01 05:30:00	food	ร้านข้าวซอย ขุนยะ	ข้าวซอยไก่ + น้ำตกหมู	cmmh69sgz0020cft5ikackd33
cmmh69sh20027cft5m3lsd6fw	เดินนิมมาน + คาเฟ่	2026-11-01 00:00:00	2026-11-01 06:00:00	2026-11-01 08:00:00	shopping	ถนนนิมมานเหมินท์	One Nimman, Think Park	cmmh69sgz0020cft5ikackd33
cmmh69sh20028cft5nawzpqjs	Ristr8to Coffee	2026-11-01 00:00:00	2026-11-01 08:00:00	2026-11-01 09:30:00	food	Ristr8to Coffee, นิมมาน	ลาเต้อาร์ต อันดับโลก	cmmh69sgz0020cft5ikackd33
cmmh69sh20029cft5o8h98gip	วัดพระธาตุดอยสุเทพ	2026-11-01 00:00:00	2026-11-01 09:30:00	2026-11-01 11:30:00	attraction	วัดพระธาตุดอยสุเทพ	ชมวิว sunset ไหว้พระ	cmmh69sgz0020cft5ikackd33
cmmh69sh2002acft5h1b0beu8	ขันโตก ครัวเฮือน	2026-11-01 00:00:00	2026-11-01 12:00:00	2026-11-01 14:00:00	food	ครัวเฮือน, เชียงใหม่	ดินเนอร์ขันโตก การแสดงพื้นบ้าน	cmmh69sgz0020cft5ikackd33
cmmh69sh4002bcft5zcynduo8	ตลาดวโรรส (กาดหลวง)	2026-11-02 00:00:00	2026-11-02 00:00:00	2026-11-02 02:00:00	shopping	ตลาดวโรรส	ซื้อหมูแดดเดียว แหนม ไส้อั่ว	cmmh69sgz0020cft5ikackd33
cmmh69sh4002ccft56kyore8g	ขับรถไปม่อนแจ่ม	2026-11-02 00:00:00	2026-11-02 02:30:00	2026-11-02 05:00:00	attraction	ม่อนแจ่ม, แม่ริม	ชมทะเลหมอก	cmmh69sgz0020cft5ikackd33
cmmh69sh4002dcft5t7y4n76f	อาหารเหนือบนดอย	2026-11-02 00:00:00	2026-11-02 05:00:00	2026-11-02 06:00:00	food	ร้านอาหารม่อนแจ่ม	ลาบหมู แกงแค	cmmh69sgz0020cft5ikackd33
cmmh69sh4002ecft59l4bfgsc	คาเฟ่ No.39	2026-11-02 00:00:00	2026-11-02 07:00:00	2026-11-02 08:30:00	food	No.39 Cafe, แม่ริม	คาเฟ่วิวดอย ถ่ายรูปสวย	cmmh69sgz0020cft5ikackd33
cmmh69sh4002fcft5oakxixvg	วัดอุโมงค์	2026-11-02 00:00:00	2026-11-02 09:00:00	2026-11-02 10:00:00	attraction	วัดอุโมงค์, สุเทพ	วัดโบราณ อุโมงค์ลึกลับ	cmmh69sgz0020cft5ikackd33
cmmh69sh4002gcft599vhmdib	ถนนคนเดิน (วันเสาร์)	2026-11-02 00:00:00	2026-11-02 11:00:00	2026-11-02 14:00:00	shopping	ถนนคนเดินวัวลาย	ไส้อั่ว หมูปิ้ง งานฝีมือ	cmmh69sgz0020cft5ikackd33
cmmh69sh7002hcft5c1v51g84	กาแฟเช้า Graph Cafe	2026-11-03 00:00:00	2026-11-03 01:00:00	2026-11-03 02:00:00	food	Graph Cafe, เชียงใหม่	\N	cmmh69sgz0020cft5ikackd33
cmmh69sh7002icft53sub0dmk	เช็คเอาท์ + คืนรถ	2026-11-03 00:00:00	2026-11-03 03:00:00	2026-11-03 04:00:00	transport	At Nimman → สนามบิน CNX	\N	cmmh69sgz0020cft5ikackd33
cmmh69sh7002jcft527schcdn	บิน CNX → BKK	2026-11-03 00:00:00	2026-11-03 07:00:00	2026-11-03 08:15:00	transport	Thai AirAsia FD3440	\N	cmmh69sgz0020cft5ikackd33
\.


--
-- TOC entry 3927 (class 0 OID 36436)
-- Dependencies: 223
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Expense" (id, amount, currency, "thbAmount", description, category, date, "createdAt", "tripId", "activityId", "payerId") FROM stdin;
cmmh69sg4000mcft5sp0lbqsc	4800000	THB	4800000	ตั๋วเครื่องบิน BKK-NRT ไปกลับ (4 คน)	transport	2026-04-09 00:00:00	2026-03-08 03:08:00.964	cmmh69sfp0001cft5hn9awvu5	\N	cmmh69sfr0002cft5oes2xxu1
cmmh69sg9000rcft56711041n	2400000	THB	2400000	โรงแรม Shinjuku Granbell 2 คืน	accommodation	2026-04-09 00:00:00	2026-03-08 03:08:00.969	cmmh69sfp0001cft5hn9awvu5	\N	cmmh69sfr0003cft5jie690xo
cmmh69sgc000wcft5t34km2ky	4400	JPY	110000	ราเม็ง Fuunji 4 ชาม	food	2026-04-09 00:00:00	2026-03-08 03:08:00.972	cmmh69sfp0001cft5hn9awvu5	\N	cmmh69sfr0004cft58sdpdcau
cmmh69sgf0011cft58u1vl7lo	2000	JPY	50000	ค่าเข้าสวนชินจูกุเกียวเอ็น	attraction	2026-04-09 00:00:00	2026-03-08 03:08:00.975	cmmh69sfp0001cft5hn9awvu5	\N	cmmh69sfr0002cft5oes2xxu1
cmmh69sgh0016cft5dujoi1cw	12000	JPY	300000	อิซากายะ Omoide Yokocho	food	2026-04-09 00:00:00	2026-03-08 03:08:00.977	cmmh69sfp0001cft5hn9awvu5	\N	cmmh69sfr0005cft5r9v94scj
cmmh69sgk001bcft5utyj74bg	16000	JPY	400000	ซูชิเช้า Toyosu 4 คน	food	2026-04-10 00:00:00	2026-03-08 03:08:00.98	cmmh69sfp0001cft5hn9awvu5	\N	cmmh69sfr0002cft5oes2xxu1
cmmh69sgn001gcft5baq8gfxr	8400	JPY	210000	ตั๋ว Tokyo Skytree 4 คน	attraction	2026-04-10 00:00:00	2026-03-08 03:08:00.983	cmmh69sfp0001cft5hn9awvu5	\N	cmmh69sfr0003cft5jie690xo
cmmh69sgq001lcft5titagmei	9600	JPY	240000	ทงคัตสึ Maisen (4 คน)	food	2026-04-10 00:00:00	2026-03-08 03:08:00.986	cmmh69sfp0001cft5hn9awvu5	\N	cmmh69sfr0004cft58sdpdcau
cmmh69sgt001qcft57y3cugg0	12320	JPY	308000	Narita Express 4 ที่นั่ง	transport	2026-04-11 00:00:00	2026-03-08 03:08:00.989	cmmh69sfp0001cft5hn9awvu5	\N	cmmh69sfr0005cft5r9v94scj
cmmh69sgw001vcft5qv8lwx9w	18000	JPY	450000	ของฝาก Duty Free	shopping	2026-04-11 00:00:00	2026-03-08 03:08:00.992	cmmh69sfp0001cft5hn9awvu5	\N	cmmh69sfr0002cft5oes2xxu1
cmmh69sh8002kcft5auot5d55	510000	THB	510000	ตั๋วเครื่องบิน BKK-CNX ไปกลับ (3 คน)	transport	2026-11-01 00:00:00	2026-03-08 03:08:01.004	cmmh69sgz0020cft5ikackd33	\N	cmmh69sgz0021cft5mcglnc35
cmmh69sha002ocft5k6t6hq39	270000	THB	270000	ค่าเช่ารถ Honda Jazz 3 วัน	transport	2026-11-01 00:00:00	2026-03-08 03:08:01.006	cmmh69sgz0020cft5ikackd33	\N	cmmh69sgz0022cft5ydwsxuvm
cmmh69shc002scft5nwo17f3z	360000	THB	360000	โรงแรม At Nimman 2 คืน	accommodation	2026-11-01 00:00:00	2026-03-08 03:08:01.008	cmmh69sgz0020cft5ikackd33	\N	cmmh69sgz0023cft56juk4nf6
cmmh69shf002wcft5yifajtnb	180000	THB	180000	ข้าวซอย + คาเฟ่ + ขันโตก Day 1	food	2026-11-01 00:00:00	2026-03-08 03:08:01.011	cmmh69sgz0020cft5ikackd33	\N	cmmh69sgz0021cft5mcglnc35
cmmh69shh0030cft5508wy3jr	120000	THB	120000	อาหาร + คาเฟ่ Day 2	food	2026-11-02 00:00:00	2026-03-08 03:08:01.013	cmmh69sgz0020cft5ikackd33	\N	cmmh69sgz0022cft5ydwsxuvm
cmmh69shj0034cft5rhuefrzk	90000	THB	90000	ถนนคนเดิน + ของฝาก	shopping	2026-11-02 00:00:00	2026-03-08 03:08:01.015	cmmh69sgz0020cft5ikackd33	\N	cmmh69sgz0023cft56juk4nf6
cmmh69shl0038cft5cxefqqj7	80000	THB	80000	น้ำมันรถ 3 วัน	transport	2026-11-03 00:00:00	2026-03-08 03:08:01.017	cmmh69sgz0020cft5ikackd33	\N	cmmh69sgz0021cft5mcglnc35
\.


--
-- TOC entry 3928 (class 0 OID 36456)
-- Dependencies: 224
-- Data for Name: ExpenseParticipant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExpenseParticipant" (id, "expenseId", "memberId", share) FROM stdin;
cmmh69sg6000ncft5z9enr5uz	cmmh69sg4000mcft5sp0lbqsc	cmmh69sfr0002cft5oes2xxu1	1200000
cmmh69sg6000ocft5u1f7db6s	cmmh69sg4000mcft5sp0lbqsc	cmmh69sfr0003cft5jie690xo	1200000
cmmh69sg6000pcft5cznelx7u	cmmh69sg4000mcft5sp0lbqsc	cmmh69sfr0004cft58sdpdcau	1200000
cmmh69sg6000qcft57tyo72p4	cmmh69sg4000mcft5sp0lbqsc	cmmh69sfr0005cft5r9v94scj	1200000
cmmh69sgb000scft5cs7jzdnn	cmmh69sg9000rcft56711041n	cmmh69sfr0002cft5oes2xxu1	600000
cmmh69sgb000tcft5cegnt9bt	cmmh69sg9000rcft56711041n	cmmh69sfr0003cft5jie690xo	600000
cmmh69sgb000ucft54jbmi4lz	cmmh69sg9000rcft56711041n	cmmh69sfr0004cft58sdpdcau	600000
cmmh69sgb000vcft5t7wzbiwn	cmmh69sg9000rcft56711041n	cmmh69sfr0005cft5r9v94scj	600000
cmmh69sgd000xcft5hn8rur2k	cmmh69sgc000wcft5t34km2ky	cmmh69sfr0002cft5oes2xxu1	27500
cmmh69sgd000ycft5rib9ulii	cmmh69sgc000wcft5t34km2ky	cmmh69sfr0003cft5jie690xo	27500
cmmh69sgd000zcft5t171z5dj	cmmh69sgc000wcft5t34km2ky	cmmh69sfr0004cft58sdpdcau	27500
cmmh69sgd0010cft5wxq1ib7w	cmmh69sgc000wcft5t34km2ky	cmmh69sfr0005cft5r9v94scj	27500
cmmh69sgg0012cft5zx6x38bf	cmmh69sgf0011cft58u1vl7lo	cmmh69sfr0002cft5oes2xxu1	12500
cmmh69sgg0013cft50uudxrut	cmmh69sgf0011cft58u1vl7lo	cmmh69sfr0003cft5jie690xo	12500
cmmh69sgg0014cft59zhxot74	cmmh69sgf0011cft58u1vl7lo	cmmh69sfr0004cft58sdpdcau	12500
cmmh69sgg0015cft5fk6hnyrt	cmmh69sgf0011cft58u1vl7lo	cmmh69sfr0005cft5r9v94scj	12500
cmmh69sgi0017cft5gdj9qvff	cmmh69sgh0016cft5dujoi1cw	cmmh69sfr0002cft5oes2xxu1	75000
cmmh69sgi0018cft5kbqfmlvl	cmmh69sgh0016cft5dujoi1cw	cmmh69sfr0003cft5jie690xo	75000
cmmh69sgi0019cft5de6gwnxp	cmmh69sgh0016cft5dujoi1cw	cmmh69sfr0004cft58sdpdcau	75000
cmmh69sgi001acft5vvzhv5i3	cmmh69sgh0016cft5dujoi1cw	cmmh69sfr0005cft5r9v94scj	75000
cmmh69sgm001ccft5cn2prk9g	cmmh69sgk001bcft5utyj74bg	cmmh69sfr0002cft5oes2xxu1	100000
cmmh69sgm001dcft5k1wk38ac	cmmh69sgk001bcft5utyj74bg	cmmh69sfr0003cft5jie690xo	100000
cmmh69sgm001ecft5hww2s7nu	cmmh69sgk001bcft5utyj74bg	cmmh69sfr0004cft58sdpdcau	100000
cmmh69sgm001fcft5bavmbmkr	cmmh69sgk001bcft5utyj74bg	cmmh69sfr0005cft5r9v94scj	100000
cmmh69sgp001hcft5kiuvnj7m	cmmh69sgn001gcft5baq8gfxr	cmmh69sfr0002cft5oes2xxu1	52500
cmmh69sgp001icft5u4560aas	cmmh69sgn001gcft5baq8gfxr	cmmh69sfr0003cft5jie690xo	52500
cmmh69sgp001jcft52v8e6g35	cmmh69sgn001gcft5baq8gfxr	cmmh69sfr0004cft58sdpdcau	52500
cmmh69sgp001kcft52cgnvwlv	cmmh69sgn001gcft5baq8gfxr	cmmh69sfr0005cft5r9v94scj	52500
cmmh69sgs001mcft5vsji2u3c	cmmh69sgq001lcft5titagmei	cmmh69sfr0002cft5oes2xxu1	60000
cmmh69sgs001ncft5jws8qa23	cmmh69sgq001lcft5titagmei	cmmh69sfr0003cft5jie690xo	60000
cmmh69sgs001ocft5cj4uduoa	cmmh69sgq001lcft5titagmei	cmmh69sfr0004cft58sdpdcau	60000
cmmh69sgs001pcft53pik425o	cmmh69sgq001lcft5titagmei	cmmh69sfr0005cft5r9v94scj	60000
cmmh69sgv001rcft5vm8t9huj	cmmh69sgt001qcft57y3cugg0	cmmh69sfr0002cft5oes2xxu1	77000
cmmh69sgv001scft5j1h7e6r5	cmmh69sgt001qcft57y3cugg0	cmmh69sfr0003cft5jie690xo	77000
cmmh69sgv001tcft55rip2szn	cmmh69sgt001qcft57y3cugg0	cmmh69sfr0004cft58sdpdcau	77000
cmmh69sgv001ucft5lj43sfxu	cmmh69sgt001qcft57y3cugg0	cmmh69sfr0005cft5r9v94scj	77000
cmmh69sgx001wcft5kznwdum1	cmmh69sgw001vcft5qv8lwx9w	cmmh69sfr0002cft5oes2xxu1	112500
cmmh69sgx001xcft5u89n6o7v	cmmh69sgw001vcft5qv8lwx9w	cmmh69sfr0003cft5jie690xo	112500
cmmh69sgx001ycft5nhfddcmd	cmmh69sgw001vcft5qv8lwx9w	cmmh69sfr0004cft58sdpdcau	112500
cmmh69sgx001zcft5r5hlekkh	cmmh69sgw001vcft5qv8lwx9w	cmmh69sfr0005cft5r9v94scj	112500
cmmh69sh9002lcft5qr7lqma1	cmmh69sh8002kcft5auot5d55	cmmh69sgz0021cft5mcglnc35	170000
cmmh69sh9002mcft5dfr6wu65	cmmh69sh8002kcft5auot5d55	cmmh69sgz0022cft5ydwsxuvm	170000
cmmh69sh9002ncft56o7ztt4b	cmmh69sh8002kcft5auot5d55	cmmh69sgz0023cft56juk4nf6	170000
cmmh69shb002pcft5l4brrqp4	cmmh69sha002ocft5k6t6hq39	cmmh69sgz0021cft5mcglnc35	90000
cmmh69shb002qcft5xem737zl	cmmh69sha002ocft5k6t6hq39	cmmh69sgz0022cft5ydwsxuvm	90000
cmmh69shb002rcft53qd7c0k4	cmmh69sha002ocft5k6t6hq39	cmmh69sgz0023cft56juk4nf6	90000
cmmh69shd002tcft5aceerns1	cmmh69shc002scft5nwo17f3z	cmmh69sgz0021cft5mcglnc35	120000
cmmh69shd002ucft5omvpqq62	cmmh69shc002scft5nwo17f3z	cmmh69sgz0022cft5ydwsxuvm	120000
cmmh69shd002vcft5dx42fme8	cmmh69shc002scft5nwo17f3z	cmmh69sgz0023cft56juk4nf6	120000
cmmh69shg002xcft5vn2pp7q7	cmmh69shf002wcft5yifajtnb	cmmh69sgz0021cft5mcglnc35	60000
cmmh69shg002ycft5zqqvj5qe	cmmh69shf002wcft5yifajtnb	cmmh69sgz0022cft5ydwsxuvm	60000
cmmh69shg002zcft55dw26h0c	cmmh69shf002wcft5yifajtnb	cmmh69sgz0023cft56juk4nf6	60000
cmmh69shi0031cft5d3w84amz	cmmh69shh0030cft5508wy3jr	cmmh69sgz0021cft5mcglnc35	40000
cmmh69shi0032cft50ebs7sfs	cmmh69shh0030cft5508wy3jr	cmmh69sgz0022cft5ydwsxuvm	40000
cmmh69shi0033cft5cillpxrc	cmmh69shh0030cft5508wy3jr	cmmh69sgz0023cft56juk4nf6	40000
cmmh69shk0035cft5useppquy	cmmh69shj0034cft5rhuefrzk	cmmh69sgz0021cft5mcglnc35	30000
cmmh69shk0036cft5ciunj8r7	cmmh69shj0034cft5rhuefrzk	cmmh69sgz0022cft5ydwsxuvm	30000
cmmh69shk0037cft5u2fqxvv7	cmmh69shj0034cft5rhuefrzk	cmmh69sgz0023cft56juk4nf6	30000
cmmh69shm0039cft5gx9y2qtq	cmmh69shl0038cft5cxefqqj7	cmmh69sgz0021cft5mcglnc35	26667
cmmh69shm003acft5qjai5pre	cmmh69shl0038cft5cxefqqj7	cmmh69sgz0022cft5ydwsxuvm	26667
cmmh69shm003bcft5i44uixbb	cmmh69shl0038cft5cxefqqj7	cmmh69sgz0023cft56juk4nf6	26667
\.


--
-- TOC entry 3925 (class 0 OID 36410)
-- Dependencies: 221
-- Data for Name: Member; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Member" (id, name, "tripId", role) FROM stdin;
cmmh69sfr0002cft5oes2xxu1	Wind	cmmh69sfp0001cft5hn9awvu5	LEADER
cmmh69sfr0003cft5jie690xo	Arm	cmmh69sfp0001cft5hn9awvu5	MEMBER
cmmh69sfr0004cft58sdpdcau	Mind	cmmh69sfp0001cft5hn9awvu5	MEMBER
cmmh69sfr0005cft5r9v94scj	Aom	cmmh69sfp0001cft5hn9awvu5	MEMBER
cmmh69sgz0021cft5mcglnc35	Aom	cmmh69sgz0020cft5ikackd33	LEADER
cmmh69sgz0022cft5ydwsxuvm	Fah	cmmh69sgz0020cft5ikackd33	MEMBER
cmmh69sgz0023cft56juk4nf6	Earth	cmmh69sgz0020cft5ikackd33	MEMBER
\.


--
-- TOC entry 3930 (class 0 OID 36485)
-- Dependencies: 226
-- Data for Name: SavedContact; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SavedContact" (id, name, "createdAt") FROM stdin;
cmmh69shn003ccft5wx7xm5w1	Wind	2026-03-08 03:08:01.019
cmmh69shn003dcft5uelcpbhb	Arm	2026-03-08 03:08:01.019
cmmh69shn003ecft5vuaj5krw	Mind	2026-03-08 03:08:01.019
cmmh69shn003fcft5ntn6clte	Aom	2026-03-08 03:08:01.019
cmmh69shn003gcft55azzzc55	Fah	2026-03-08 03:08:01.019
cmmh69shn003hcft59nfnivhs	Earth	2026-03-08 03:08:01.019
\.


--
-- TOC entry 3929 (class 0 OID 36467)
-- Dependencies: 225
-- Data for Name: Settlement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Settlement" (id, amount, currency, status, "createdAt", "tripId", "debtorId", "creditorId", "slipUrl") FROM stdin;
\.


--
-- TOC entry 3924 (class 0 OID 36390)
-- Dependencies: 220
-- Data for Name: Trip; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Trip" (id, name, "startDate", "endDate", timezone, budget, "order", "createdAt", "updatedAt", description, "coverImage", "userId") FROM stdin;
cmmh69sfp0001cft5hn9awvu5	Tokyo Spring Trip 🌸	2026-04-09 00:00:00	2026-04-11 00:00:00	Asia/Tokyo	10000000	0	2026-03-08 03:08:00.949	2026-03-08 03:08:00.949	เที่ยวโตเกียว ชมซากุระ ช้อปปิ้ง กินดื่ม	\N	cmmh69sf60000cft5vc7bqhgw
cmmh69sgz0020cft5ikackd33	เชียงใหม่ หน้าหนาว ❄️	2026-11-01 00:00:00	2026-11-03 00:00:00	Asia/Bangkok	2000000	0	2026-03-08 03:08:00.995	2026-03-08 03:08:00.995	ขึ้นดอย กินข้าวซอย เที่ยวคาเฟ่ ถนนคนเดิน	\N	cmmh69sf60000cft5vc7bqhgw
\.


--
-- TOC entry 3931 (class 0 OID 36496)
-- Dependencies: 227
-- Data for Name: TripImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TripImage" (id, url, caption, "createdAt", "tripId") FROM stdin;
\.


--
-- TOC entry 3923 (class 0 OID 36377)
-- Dependencies: 219
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, username, "passwordHash", "createdAt") FROM stdin;
cmmh69sf60000cft5vc7bqhgw	Admin User	admin	$2b$12$sXwnpvZVpLUGIR3LmYrpmu/u300ZRpLqfKPQyeiU/q4lMHdDMRweW	2026-03-08 03:08:00.93
\.


--
-- TOC entry 3751 (class 2606 OID 36435)
-- Name: Activity Activity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_pkey" PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 36466)
-- Name: ExpenseParticipant ExpenseParticipant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExpenseParticipant"
    ADD CONSTRAINT "ExpenseParticipant_pkey" PRIMARY KEY (id);


--
-- TOC entry 3753 (class 2606 OID 36455)
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- TOC entry 3749 (class 2606 OID 36421)
-- Name: Member Member_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Member"
    ADD CONSTRAINT "Member_pkey" PRIMARY KEY (id);


--
-- TOC entry 3761 (class 2606 OID 36495)
-- Name: SavedContact SavedContact_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedContact"
    ADD CONSTRAINT "SavedContact_pkey" PRIMARY KEY (id);


--
-- TOC entry 3758 (class 2606 OID 36484)
-- Name: Settlement Settlement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settlement"
    ADD CONSTRAINT "Settlement_pkey" PRIMARY KEY (id);


--
-- TOC entry 3763 (class 2606 OID 36507)
-- Name: TripImage TripImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TripImage"
    ADD CONSTRAINT "TripImage_pkey" PRIMARY KEY (id);


--
-- TOC entry 3747 (class 2606 OID 36409)
-- Name: Trip Trip_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Trip"
    ADD CONSTRAINT "Trip_pkey" PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 36389)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3754 (class 1259 OID 36509)
-- Name: ExpenseParticipant_expenseId_memberId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ExpenseParticipant_expenseId_memberId_key" ON public."ExpenseParticipant" USING btree ("expenseId", "memberId");


--
-- TOC entry 3759 (class 1259 OID 36510)
-- Name: SavedContact_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SavedContact_name_key" ON public."SavedContact" USING btree (name);


--
-- TOC entry 3745 (class 1259 OID 36508)
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- TOC entry 3766 (class 2606 OID 36521)
-- Name: Activity Activity_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public."Trip"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3770 (class 2606 OID 36541)
-- Name: ExpenseParticipant ExpenseParticipant_expenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExpenseParticipant"
    ADD CONSTRAINT "ExpenseParticipant_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES public."Expense"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3771 (class 2606 OID 36546)
-- Name: ExpenseParticipant ExpenseParticipant_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExpenseParticipant"
    ADD CONSTRAINT "ExpenseParticipant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3767 (class 2606 OID 36531)
-- Name: Expense Expense_activityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public."Activity"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3768 (class 2606 OID 36536)
-- Name: Expense Expense_payerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3769 (class 2606 OID 36526)
-- Name: Expense Expense_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public."Trip"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3765 (class 2606 OID 36516)
-- Name: Member Member_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Member"
    ADD CONSTRAINT "Member_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public."Trip"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3772 (class 2606 OID 36561)
-- Name: Settlement Settlement_creditorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settlement"
    ADD CONSTRAINT "Settlement_creditorId_fkey" FOREIGN KEY ("creditorId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3773 (class 2606 OID 36556)
-- Name: Settlement Settlement_debtorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settlement"
    ADD CONSTRAINT "Settlement_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3774 (class 2606 OID 36551)
-- Name: Settlement Settlement_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settlement"
    ADD CONSTRAINT "Settlement_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public."Trip"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3775 (class 2606 OID 36566)
-- Name: TripImage TripImage_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TripImage"
    ADD CONSTRAINT "TripImage_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public."Trip"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3764 (class 2606 OID 36511)
-- Name: Trip Trip_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Trip"
    ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3938 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-03-08 14:07:26 +07

--
-- PostgreSQL database dump complete
--

\unrestrict enPpflV9Eh4V6eyt8DrRdG5BLpGyxLO6ofNpw7GzXIS1gt2EOBfmovhLCmg6Zx0

