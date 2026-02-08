import "dotenv/config";
import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🗑️  ลบข้อมูลทริปเก่าทั้งหมด...");
  await prisma.expenseParticipant.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.tripImage.deleteMany();
  await prisma.member.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.savedContact.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ ลบเรียบร้อย");

  console.log("👤 สร้างผู้ใช้งานเริ่มต้น (Admin)...");
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      username: "admin",
      passwordHash,
    },
  });

  console.log("\n🌱 Seed ทริปใหม่...");

  // Helper
  const createExpense = async (
    tripId: string,
    desc: string,
    amount: number,
    currency: string,
    thb: number,
    cat: string,
    date: Date,
    payerId: string,
    memberIds: string[],
  ) => {
    const shareEach = Math.round(thb / memberIds.length);
    const exp = await prisma.expense.create({
      data: {
        tripId,
        description: desc,
        amount,
        currency,
        thbAmount: thb,
        category: cat,
        date,
        payerId,
      },
    });
    await prisma.expenseParticipant.createMany({
      data: memberIds.map((id) => ({
        expenseId: exp.id,
        memberId: id,
        share: shareEach,
      })),
    });
  };

  // ============================================================
  // TRIP 1: Tokyo Spring Trip 🌸  (9-11 เม.ย. 2026)
  // ============================================================
  const tokyo = await prisma.trip.create({
    data: {
      name: "Tokyo Spring Trip 🌸",
      userId: admin.id,
      startDate: new Date("2026-04-09"),
      endDate: new Date("2026-04-11"),
      timezone: "Asia/Tokyo",
      budget: 10000000,
      description: "เที่ยวโตเกียว ชมซากุระ ช้อปปิ้ง กินดื่ม",
      members: {
        create: [
          { name: "Wind", role: "LEADER" },
          { name: "Arm", role: "MEMBER" },
          { name: "Mind", role: "MEMBER" },
          { name: "Aom", role: "MEMBER" },
        ],
      },
    },
    include: { members: true },
  });
  const [w, a, m, o] = tokyo.members;
  const t1All = [w.id, a.id, m.id, o.id];

  // Day 1 Activities
  await prisma.activity.createMany({
    data: [
      {
        tripId: tokyo.id,
        name: "ถึงสนามบินนาริตะ",
        date: new Date("2026-04-09"),
        startTime: new Date("2026-04-08T23:00:00Z"),
        endTime: new Date("2026-04-09T00:30:00Z"),
        category: "transport",
        location: "Narita International Airport",
        notes: "ผ่านตม. รับกระเป๋า ซื้อ Suica Card",
      },
      {
        tripId: tokyo.id,
        name: "เช็คอินโรงแรม Shinjuku",
        date: new Date("2026-04-09"),
        startTime: new Date("2026-04-09T02:00:00Z"),
        endTime: new Date("2026-04-09T03:00:00Z"),
        category: "accommodation",
        location: "Shinjuku Granbell Hotel",
        notes: "ฝากกระเป๋าก่อน เช็คอินจริง 15:00",
      },
      {
        tripId: tokyo.id,
        name: "กินราเม็ง Fuunji",
        date: new Date("2026-04-09"),
        startTime: new Date("2026-04-09T03:00:00Z"),
        endTime: new Date("2026-04-09T04:00:00Z"),
        category: "food",
        location: "Fuunji Ramen, Shinjuku",
        notes: "ราเม็งแบบ tsukemen ร้านดัง ต่อคิว 20 นาที",
      },
      {
        tripId: tokyo.id,
        name: "ช้อปปิ้งชินจูกุ",
        date: new Date("2026-04-09"),
        startTime: new Date("2026-04-09T04:30:00Z"),
        endTime: new Date("2026-04-09T07:00:00Z"),
        category: "shopping",
        location: "Shinjuku, Tokyo",
        notes: "Don Quijote, Kabukicho, Uniqlo",
      },
      {
        tripId: tokyo.id,
        name: "ชมซากุระ สวนชินจูกุเกียวเอ็น",
        date: new Date("2026-04-09"),
        startTime: new Date("2026-04-09T07:00:00Z"),
        endTime: new Date("2026-04-09T09:00:00Z"),
        category: "attraction",
        location: "Shinjuku Gyoen National Garden",
        notes: "ค่าเข้า 500 เยนต่อคน ถ่ายรูปซากุระ",
      },
      {
        tripId: tokyo.id,
        name: "อิซากายะ โอโมอิเดะ โยโกโจ",
        date: new Date("2026-04-09"),
        startTime: new Date("2026-04-09T09:30:00Z"),
        endTime: new Date("2026-04-09T11:30:00Z"),
        category: "food",
        location: "Omoide Yokocho, Shinjuku",
        notes: "ยากิโทริ + เบียร์สด",
      },
    ],
  });

  // Day 2 Activities
  await prisma.activity.createMany({
    data: [
      {
        tripId: tokyo.id,
        name: "ซูชิเช้าที่ตลาด Toyosu",
        date: new Date("2026-04-10"),
        startTime: new Date("2026-04-09T21:30:00Z"),
        endTime: new Date("2026-04-10T00:00:00Z"),
        category: "food",
        location: "Toyosu Fish Market",
        notes: "กินซูชิสดๆ ดูประมูลทูน่ายักษ์",
      },
      {
        tripId: tokyo.id,
        name: "เที่ยววัดเซ็นโซจิ",
        date: new Date("2026-04-10"),
        startTime: new Date("2026-04-10T01:00:00Z"),
        endTime: new Date("2026-04-10T03:00:00Z"),
        category: "attraction",
        location: "Senso-ji Temple, Asakusa",
        notes: "เดินถนน Nakamise ซื้อของฝาก",
      },
      {
        tripId: tokyo.id,
        name: "กินโมนจายากิ Sometaro",
        date: new Date("2026-04-10"),
        startTime: new Date("2026-04-10T03:30:00Z"),
        endTime: new Date("2026-04-10T04:30:00Z"),
        category: "food",
        location: "Sometaro, Asakusa",
        notes: "ร้าน DIY โมนจายากิ สนุกสุดๆ",
      },
      {
        tripId: tokyo.id,
        name: "ช้อปปิ้ง Akihabara",
        date: new Date("2026-04-10"),
        startTime: new Date("2026-04-10T05:00:00Z"),
        endTime: new Date("2026-04-10T08:00:00Z"),
        category: "shopping",
        location: "Akihabara, Tokyo",
        notes: "ร้านการ์ดเกม, Yodobashi Camera",
      },
      {
        tripId: tokyo.id,
        name: "ชมวิว Tokyo Skytree",
        date: new Date("2026-04-10"),
        startTime: new Date("2026-04-10T09:00:00Z"),
        endTime: new Date("2026-04-10T11:00:00Z"),
        category: "attraction",
        location: "Tokyo Skytree",
        notes: "ชมวิว sunset ค่าเข้า 2,100 เยน",
      },
      {
        tripId: tokyo.id,
        name: "ทงคัตสึ Maisen",
        date: new Date("2026-04-10"),
        startTime: new Date("2026-04-10T11:30:00Z"),
        endTime: new Date("2026-04-10T12:30:00Z"),
        category: "food",
        location: "Maisen Tonkatsu, Omotesando",
        notes: "หมูทอดระดับตำนาน",
      },
    ],
  });

  // Day 3 Activities
  await prisma.activity.createMany({
    data: [
      {
        tripId: tokyo.id,
        name: "ศาลเจ้าเมจิ + ป่ากลางกรุง",
        date: new Date("2026-04-11"),
        startTime: new Date("2026-04-10T23:00:00Z"),
        endTime: new Date("2026-04-11T00:30:00Z"),
        category: "attraction",
        location: "Meiji Jingu Shrine",
      },
      {
        tripId: tokyo.id,
        name: "ช้อปปิ้ง Harajuku",
        date: new Date("2026-04-11"),
        startTime: new Date("2026-04-11T01:00:00Z"),
        endTime: new Date("2026-04-11T03:00:00Z"),
        category: "shopping",
        location: "Takeshita Street, Harajuku",
        notes: "เครปญี่ปุ่น แฟชั่น street",
      },
      {
        tripId: tokyo.id,
        name: "เช็คเอาท์ + Narita Express",
        date: new Date("2026-04-11"),
        startTime: new Date("2026-04-11T04:00:00Z"),
        endTime: new Date("2026-04-11T07:30:00Z"),
        category: "transport",
        location: "Narita Express (N'EX)",
        notes: "รถไฟ 60 นาทีถึงสนามบิน",
      },
      {
        tripId: tokyo.id,
        name: "ช้อปปิ้ง Duty Free",
        date: new Date("2026-04-11"),
        startTime: new Date("2026-04-11T08:00:00Z"),
        endTime: new Date("2026-04-11T10:00:00Z"),
        category: "shopping",
        location: "Narita Airport Terminal 1",
        notes: "Tokyo Banana, Royce",
      },
    ],
  });

  // Tokyo Expenses
  await createExpense(
    tokyo.id,
    "ตั๋วเครื่องบิน BKK-NRT ไปกลับ (4 คน)",
    4800000,
    "THB",
    4800000,
    "transport",
    new Date("2026-04-09"),
    w.id,
    t1All,
  );
  await createExpense(
    tokyo.id,
    "โรงแรม Shinjuku Granbell 2 คืน",
    2400000,
    "THB",
    2400000,
    "accommodation",
    new Date("2026-04-09"),
    a.id,
    t1All,
  );
  await createExpense(
    tokyo.id,
    "ราเม็ง Fuunji 4 ชาม",
    4400,
    "JPY",
    110000,
    "food",
    new Date("2026-04-09"),
    m.id,
    t1All,
  );
  await createExpense(
    tokyo.id,
    "ค่าเข้าสวนชินจูกุเกียวเอ็น",
    2000,
    "JPY",
    50000,
    "attraction",
    new Date("2026-04-09"),
    w.id,
    t1All,
  );
  await createExpense(
    tokyo.id,
    "อิซากายะ Omoide Yokocho",
    12000,
    "JPY",
    300000,
    "food",
    new Date("2026-04-09"),
    o.id,
    t1All,
  );
  await createExpense(
    tokyo.id,
    "ซูชิเช้า Toyosu 4 คน",
    16000,
    "JPY",
    400000,
    "food",
    new Date("2026-04-10"),
    w.id,
    t1All,
  );
  await createExpense(
    tokyo.id,
    "ตั๋ว Tokyo Skytree 4 คน",
    8400,
    "JPY",
    210000,
    "attraction",
    new Date("2026-04-10"),
    a.id,
    t1All,
  );
  await createExpense(
    tokyo.id,
    "ทงคัตสึ Maisen (4 คน)",
    9600,
    "JPY",
    240000,
    "food",
    new Date("2026-04-10"),
    m.id,
    t1All,
  );
  await createExpense(
    tokyo.id,
    "Narita Express 4 ที่นั่ง",
    12320,
    "JPY",
    308000,
    "transport",
    new Date("2026-04-11"),
    o.id,
    t1All,
  );
  await createExpense(
    tokyo.id,
    "ของฝาก Duty Free",
    18000,
    "JPY",
    450000,
    "shopping",
    new Date("2026-04-11"),
    w.id,
    t1All,
  );

  console.log(`✅ Tokyo Trip: 18 กิจกรรม, 10 ค่าใช้จ่าย`);

  // ============================================================
  // TRIP 2: เชียงใหม่ หน้าหนาว ❄️  (1-3 พ.ย. 2026)
  // ============================================================
  const cm = await prisma.trip.create({
    data: {
      name: "เชียงใหม่ หน้าหนาว ❄️",
      userId: admin.id,
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-03"),
      timezone: "Asia/Bangkok",
      budget: 2000000,
      description: "ขึ้นดอย กินข้าวซอย เที่ยวคาเฟ่ ถนนคนเดิน",
      members: {
        create: [
          { name: "Aom", role: "LEADER" },
          { name: "Fah", role: "MEMBER" },
          { name: "Earth", role: "MEMBER" },
        ],
      },
    },
    include: { members: true },
  });
  const [cA, cF, cE] = cm.members;
  const t2All = [cA.id, cF.id, cE.id];

  // Day 1
  await prisma.activity.createMany({
    data: [
      {
        tripId: cm.id,
        name: "ถึง CNX + รับรถเช่า",
        date: new Date("2026-11-01"),
        startTime: new Date("2026-11-01T02:00:00Z"),
        endTime: new Date("2026-11-01T03:00:00Z"),
        category: "transport",
        location: "Chiang Mai Airport",
        notes: "Honda Jazz ออโต้",
      },
      {
        tripId: cm.id,
        name: "เช็คอิน At Nimman",
        date: new Date("2026-11-01"),
        startTime: new Date("2026-11-01T03:30:00Z"),
        endTime: new Date("2026-11-01T04:00:00Z"),
        category: "accommodation",
        location: "At Nimman Hotel",
      },
      {
        tripId: cm.id,
        name: "ข้าวซอย ขุนยะ",
        date: new Date("2026-11-01"),
        startTime: new Date("2026-11-01T04:30:00Z"),
        endTime: new Date("2026-11-01T05:30:00Z"),
        category: "food",
        location: "ร้านข้าวซอย ขุนยะ",
        notes: "ข้าวซอยไก่ + น้ำตกหมู",
      },
      {
        tripId: cm.id,
        name: "เดินนิมมาน + คาเฟ่",
        date: new Date("2026-11-01"),
        startTime: new Date("2026-11-01T06:00:00Z"),
        endTime: new Date("2026-11-01T08:00:00Z"),
        category: "shopping",
        location: "ถนนนิมมานเหมินท์",
        notes: "One Nimman, Think Park",
      },
      {
        tripId: cm.id,
        name: "Ristr8to Coffee",
        date: new Date("2026-11-01"),
        startTime: new Date("2026-11-01T08:00:00Z"),
        endTime: new Date("2026-11-01T09:30:00Z"),
        category: "food",
        location: "Ristr8to Coffee, นิมมาน",
        notes: "ลาเต้อาร์ต อันดับโลก",
      },
      {
        tripId: cm.id,
        name: "วัดพระธาตุดอยสุเทพ",
        date: new Date("2026-11-01"),
        startTime: new Date("2026-11-01T09:30:00Z"),
        endTime: new Date("2026-11-01T11:30:00Z"),
        category: "attraction",
        location: "วัดพระธาตุดอยสุเทพ",
        notes: "ชมวิว sunset ไหว้พระ",
      },
      {
        tripId: cm.id,
        name: "ขันโตก ครัวเฮือน",
        date: new Date("2026-11-01"),
        startTime: new Date("2026-11-01T12:00:00Z"),
        endTime: new Date("2026-11-01T14:00:00Z"),
        category: "food",
        location: "ครัวเฮือน, เชียงใหม่",
        notes: "ดินเนอร์ขันโตก การแสดงพื้นบ้าน",
      },
    ],
  });

  // Day 2
  await prisma.activity.createMany({
    data: [
      {
        tripId: cm.id,
        name: "ตลาดวโรรส (กาดหลวง)",
        date: new Date("2026-11-02"),
        startTime: new Date("2026-11-02T00:00:00Z"),
        endTime: new Date("2026-11-02T02:00:00Z"),
        category: "shopping",
        location: "ตลาดวโรรส",
        notes: "ซื้อหมูแดดเดียว แหนม ไส้อั่ว",
      },
      {
        tripId: cm.id,
        name: "ขับรถไปม่อนแจ่ม",
        date: new Date("2026-11-02"),
        startTime: new Date("2026-11-02T02:30:00Z"),
        endTime: new Date("2026-11-02T05:00:00Z"),
        category: "attraction",
        location: "ม่อนแจ่ม, แม่ริม",
        notes: "ชมทะเลหมอก",
      },
      {
        tripId: cm.id,
        name: "อาหารเหนือบนดอย",
        date: new Date("2026-11-02"),
        startTime: new Date("2026-11-02T05:00:00Z"),
        endTime: new Date("2026-11-02T06:00:00Z"),
        category: "food",
        location: "ร้านอาหารม่อนแจ่ม",
        notes: "ลาบหมู แกงแค",
      },
      {
        tripId: cm.id,
        name: "คาเฟ่ No.39",
        date: new Date("2026-11-02"),
        startTime: new Date("2026-11-02T07:00:00Z"),
        endTime: new Date("2026-11-02T08:30:00Z"),
        category: "food",
        location: "No.39 Cafe, แม่ริม",
        notes: "คาเฟ่วิวดอย ถ่ายรูปสวย",
      },
      {
        tripId: cm.id,
        name: "วัดอุโมงค์",
        date: new Date("2026-11-02"),
        startTime: new Date("2026-11-02T09:00:00Z"),
        endTime: new Date("2026-11-02T10:00:00Z"),
        category: "attraction",
        location: "วัดอุโมงค์, สุเทพ",
        notes: "วัดโบราณ อุโมงค์ลึกลับ",
      },
      {
        tripId: cm.id,
        name: "ถนนคนเดิน (วันเสาร์)",
        date: new Date("2026-11-02"),
        startTime: new Date("2026-11-02T11:00:00Z"),
        endTime: new Date("2026-11-02T14:00:00Z"),
        category: "shopping",
        location: "ถนนคนเดินวัวลาย",
        notes: "ไส้อั่ว หมูปิ้ง งานฝีมือ",
      },
    ],
  });

  // Day 3
  await prisma.activity.createMany({
    data: [
      {
        tripId: cm.id,
        name: "กาแฟเช้า Graph Cafe",
        date: new Date("2026-11-03"),
        startTime: new Date("2026-11-03T01:00:00Z"),
        endTime: new Date("2026-11-03T02:00:00Z"),
        category: "food",
        location: "Graph Cafe, เชียงใหม่",
      },
      {
        tripId: cm.id,
        name: "เช็คเอาท์ + คืนรถ",
        date: new Date("2026-11-03"),
        startTime: new Date("2026-11-03T03:00:00Z"),
        endTime: new Date("2026-11-03T04:00:00Z"),
        category: "transport",
        location: "At Nimman → สนามบิน CNX",
      },
      {
        tripId: cm.id,
        name: "บิน CNX → BKK",
        date: new Date("2026-11-03"),
        startTime: new Date("2026-11-03T07:00:00Z"),
        endTime: new Date("2026-11-03T08:15:00Z"),
        category: "transport",
        location: "Thai AirAsia FD3440",
      },
    ],
  });

  // Chiang Mai Expenses
  await createExpense(
    cm.id,
    "ตั๋วเครื่องบิน BKK-CNX ไปกลับ (3 คน)",
    510000,
    "THB",
    510000,
    "transport",
    new Date("2026-11-01"),
    cA.id,
    t2All,
  );
  await createExpense(
    cm.id,
    "ค่าเช่ารถ Honda Jazz 3 วัน",
    270000,
    "THB",
    270000,
    "transport",
    new Date("2026-11-01"),
    cF.id,
    t2All,
  );
  await createExpense(
    cm.id,
    "โรงแรม At Nimman 2 คืน",
    360000,
    "THB",
    360000,
    "accommodation",
    new Date("2026-11-01"),
    cE.id,
    t2All,
  );
  await createExpense(
    cm.id,
    "ข้าวซอย + คาเฟ่ + ขันโตก Day 1",
    180000,
    "THB",
    180000,
    "food",
    new Date("2026-11-01"),
    cA.id,
    t2All,
  );
  await createExpense(
    cm.id,
    "อาหาร + คาเฟ่ Day 2",
    120000,
    "THB",
    120000,
    "food",
    new Date("2026-11-02"),
    cF.id,
    t2All,
  );
  await createExpense(
    cm.id,
    "ถนนคนเดิน + ของฝาก",
    90000,
    "THB",
    90000,
    "shopping",
    new Date("2026-11-02"),
    cE.id,
    t2All,
  );
  await createExpense(
    cm.id,
    "น้ำมันรถ 3 วัน",
    80000,
    "THB",
    80000,
    "transport",
    new Date("2026-11-03"),
    cA.id,
    t2All,
  );

  console.log(`✅ Chiang Mai Trip: 16 กิจกรรม, 7 ค่าใช้จ่าย`);

  // Saved Contacts
  await prisma.savedContact.createMany({
    data: [
      { name: "Wind" },
      { name: "Arm" },
      { name: "Mind" },
      { name: "Aom" },
      { name: "Fah" },
      { name: "Earth" },
    ],
  });

  console.log("\n🎉 Seed เสร็จสิ้น! (2 ทริป, 34 กิจกรรม, 17 ค่าใช้จ่าย)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
