const messageSets = {
    A: {
        consistent: [
            { id: "一致01", text: "今日は本当に楽しかった😆" },
            { id: "一致02", text: "また近いうちに遊ぼう🥰" },
            { id: "一致03", text: "今日の写真送ってくれてありがとう☺️" }
        ],
        inconsistent: [
            { id: "不一致01", text: "今日の学食美味しかったね😢" },
            { id: "不一致02", text: "今度あの居酒屋いこう😥" },
            { id: "不一致03", text: "講義ノート見せてくれてありがとう😒" }
        ],
        ambiguous: [
            { id: "曖昧01", text: "明日のご飯楽しみだね😮" },
            { id: "曖昧02", text: "また次の授業で話そう🤔" },
            { id: "曖昧03", text: "テスト範囲教えてくれてありがとう😶" }
        ]
    },
    B: {
        consistent: [
            { id: "一致04", text: "昨日のドラマ面白かった😆" },
            { id: "一致05", text: "天気が良くて良かった🥰" },
            { id: "一致06", text: "駅まで送ってくれてありがとう☺️" }
        ],
        inconsistent: [
            { id: "不一致04", text: "今日のレストラン美味しかったね😢" },
            { id: "不一致05", text: "無事にプレゼンできて良かった😥" },
            { id: "不一致06", text: "旅行のお土産ありがとうね😒" }
        ],
        ambiguous: [
            { id: "曖昧04", text: "さっきの店員さん優しかったね😮" },
            { id: "曖昧05", text: "テスト簡単で助かったね🤔" },
            { id: "曖昧06", text: "相談に乗ってくれてありがとう😶" }
        ]
    },
    C: {
        consistent: [
            { id: "一致07", text: "買い物ついてきてくれてありがとう😆" },
            { id: "一致08", text: "新しいスマホケースいいね🥰" },
            { id: "一致09", text: "今日の服装にあってる☺️" }
        ],
        inconsistent: [
            { id: "不一致07", text: "相談乗ってくれてありがとう😢" },
            { id: "不一致08", text: "新しい服似合ってると思う😥" },
            { id: "不一致09", text: "今日の発表すごくよかったよ😒" }
        ],
        ambiguous: [
            { id: "曖昧07", text: "今日の授業面白かった〜😮" },
            { id: "曖昧08", text: "新しい髪型似合ってた🤔" },
            { id: "曖昧09", text: "さっきはありがとう😶" }
        ]
    }
};

const counterbalancedLists = [
    { friend: "A", classmate: "B", acquaintance: "C" }, // List 1
    { friend: "B", classmate: "C", acquaintance: "A" }, // List 2
    { friend: "C", classmate: "A", acquaintance: "B" }  // List 3
];

// 6通りの送信者提示パターン（ローテーション用）
const senderOrderPatterns = [
    ["friend", "classmate", "acquaintance"], // パターン1
    ["friend", "acquaintance", "classmate"], // パターン2
    ["classmate", "friend", "acquaintance"], // パターン3
    ["classmate", "acquaintance", "friend"], // パターン4
    ["acquaintance", "friend", "classmate"], // パターン5
    ["acquaintance", "classmate", "friend"]  // パターン6
];

let assignedList = null; 
let assignedSenderOrder = null;
let trialQueue = [];     
let currentTrialIndex = 0;
let messageDisplayTime = 0;
let currentBlockSenderKey = "";

const experimentData = {
    list_id: 0,
    sender_order_id: 0,
    pattern_18_id: "",
    demographics: {},
    subjectiveIntimacies: {},
    trials: [], 
    postSurvey: {},
    lsas: {}
};

const lsasQuestions = [
    "1. 人前で電話をかける", "2. 少人数のグループ活動に参加する",
    "3. 公共の場で食事をする", "4. 人と一緒に公共の場所でお酒（飲み物）を飲む",
    "5. 権威ある人と話しをする", "6. 観衆の前で何か行為をしたり話しをする",
    "7. パーティーに行く", "8. 人に姿を見られながら仕事（勉強）をする",
    "9. 人に見られながら字を書く", "10. あまりよく知らない人に電話をする",
    "11. あまりよく知らない人たちと話し合う", "12. 全く初対面の人と会う",
    "13. 公衆トイレで用を足す", "14. 他の人たちが着席して待っている部屋に入っていく",
    "15. 人々の注目を浴びる", "16. 会議で意見を言う",
    "17. 試験を受ける", "18. あまりよく知らない人に不賛成であると言う",
    "19. あまりよく知らない人と目を合わせる", "20. 仲間の前で報告する",
    "21. 誰かを誘おうとする", "22. 店に品物を返品する",
    "23. パーティを主催する", "24. 強引なセールスマンの誘いに抵抗する"
];

const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyGkdjuXD9rOthXWT2SMWqgA8jtXcd35flZwdYHYimQF9VA0nweWp6B4WN_yRoC3njZ/exec"; 

// ページ読み込み時にサーバー（GAS）からローテーション割り当てを取得する
document.addEventListener("DOMContentLoaded", () => {
    // LSASの生成
    const lsasContainer = document.getElementById("lsas-questions");
    if (lsasContainer) {
        lsasContainer.innerHTML = "";
        lsasQuestions.forEach((q, index) => {
            const div = document.createElement("div");
            div.style.marginBottom = "14px";
            div.style.paddingBottom = "8px";
            div.style.borderBottom = "1px solid #eee";
            div.innerHTML = `
                <p style="font-size:13px; font-weight:bold; margin: 4px 0;">${q}</p>
                <div style="font-size:12px; display:flex; gap:12px; flex-wrap:wrap; margin-top:4px;">
                    <label>不安・恐怖: 
                        <select id="lsas-fear-${index}" required style="padding:2px 4px;">
                            <option value="0">0: なし</option><option value="1">1: 軽度</option><option value="2">2: 中等度</option><option value="3">3: 重度</option>
                        </select>
                    </label>
                    <label>回避行動: 
                        <select id="lsas-avoid-${index}" required style="padding:2px 4px;">
                            <option value="0">0: なし(0%)</option><option value="1">1: たまに(1-33%)</option><option value="2">2: よく(33-67%)</option><option value="3">3: 通常(67-100%)</option>
                        </select>
                    </label>
                </div>
            `;
            lsasContainer.appendChild(div);
        });
    }

    // サーバーからローテーション順を取得
    fetch(GAS_WEB_APP_URL)
        .then(res => res.json())
        .then(data => {
            experimentData.list_id = data.list_id;
            experimentData.sender_order_id = data.sender_order_id;
            experimentData.pattern_18_id = (data.pattern_index !== undefined) ? (data.pattern_index + 1) : "";
            
            assignedList = counterbalancedLists[data.list_id - 1];
            assignedSenderOrder = senderOrderPatterns[data.sender_order_id - 1];
            console.log(`割り振られたList: ${data.list_id}, 提示順: ${data.sender_order_id}, 18パターンID: ${experimentData.pattern_18_id}`);
        })
        .catch(err => {
            console.error("ローテーション取得失敗、ランダムフォールバック:", err);
            const listIdx = Math.floor(Math.random() * 3);
            const senderOrderIdx = Math.floor(Math.random() * 6);
            
            experimentData.list_id = listIdx + 1;
            experimentData.sender_order_id = senderOrderIdx + 1;
            experimentData.pattern_18_id = "Fallback";
            
            assignedList = counterbalancedLists[listIdx];
            assignedSenderOrder = senderOrderPatterns[senderOrderIdx];
        });
}); // ← ここでDOMContentLoadedが正しく閉じます

function startSurvey() {
    document.getElementById("step-opening").classList.add("hidden");
    document.getElementById("step-demographics").classList.remove("hidden");
    window.scrollTo(0, 0);
}

function goToInstruction() {
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;

    if (!age || !gender) {
        alert("年齢と性別を入力してください。");
        return;
    }

    experimentData.demographics = { age: age, gender: gender };

    buildTrialQueue();

    currentTrialIndex = 0;
    document.getElementById("step-demographics").classList.add("hidden");
    showBlockInstruction();
}

function buildTrialQueue() {
    const senderDefs = {
        friend: { key: "friend", roleName: "親友（何でも話せる最も親しい友人）", nameShort: "親友", setKey: assignedList.friend },
        classmate: { key: "classmate", roleName: "普通に話す友人（よく一緒に過ごす友人）", nameShort: "友人", setKey: assignedList.classmate },
        acquaintance: { key: "acquaintance", roleName: "あまり話さないクラスメイト（顔見知り程度の友人）", nameShort: "知人", setKey: assignedList.acquaintance }
    };

    const senders = assignedSenderOrder.map(key => senderDefs[key]);

    trialQueue = [];
    senders.forEach(sender => {
        const targetSet = messageSets[sender.setKey];
        let blockTrials = [];

        const condMap = { consistent: "一致", inconsistent: "不一致", ambiguous: "曖昧" };

        ["consistent", "inconsistent", "ambiguous"].forEach(cond => {
            const pool = targetSet[cond];
            pool.forEach(msg => {
                const patternLabel = sender.nameShort + "_" + condMap[cond];
                blockTrials.push({
                    senderKey: sender.key,
                    roleName: sender.roleName,
                    assignedSet: sender.setKey,
                    condition: cond,
                    messageId: msg.id,
                    messageText: msg.text,
                    pattern_18: patternLabel
                });
            });
        });

        shuffleArray(blockTrials);
        trialQueue.push(...blockTrials);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showBlockInstruction() {
    const currentTrial = trialQueue[currentTrialIndex];
    currentBlockSenderKey = currentTrial.senderKey;

    const titleEl = document.getElementById("block-title");
    const textEl = document.getElementById("block-instruction-text");
    const qTitleEl = document.getElementById("relation-question-title");

    titleEl.textContent = `【送信者：${currentTrial.roleName.split('（')[0]}】`;

    if (currentBlockSenderKey === "friend") {
        textEl.innerHTML = "これから<strong>「親友（何でも気軽に話せる、自分にとって最も親しい友人）」</strong>からのメッセージが届きます（全9件）。自分のプライベートなことや本音を包み隠さず話せる、一番仲の良い友人の姿を一人頭の中で強くイメージしてください。";
        qTitleEl.textContent = "Q. イメージしたその友人と、普段どのくらい親しいですか？（1: 全く親しくない 〜 7: 非常に親しい）";
    } else if (currentBlockSenderKey === "classmate") {
        textEl.innerHTML = "これから<strong>「普通に話す友人（大学でよく一緒に行動したり授業で頻繁に雑談したりする友人）」</strong>からのメッセージが届きます（全9件）。特別に深い相談はしないけれど楽しくお喋りする、ちょうどいい距離感の友人の姿を一人頭の中で強くイメージしてください。";
        qTitleEl.textContent = "Q. イメージしたその友人と、普段どのくらい親しいですか？（1: 全く親しくない 〜 7: 非常に親しい）";
    } else if (currentBlockSenderKey === "acquaintance") {
        textEl.innerHTML = "これから<strong>「あまり話さないクラスメイト（同じクラスや講義にいるけれど、自分から積極的に話しかけることは少ない友人）」</strong>からのメッセージが届きます（全9件）。挨拶や必要な連絡はするもののプライベートで連絡を取り合うほどではない、少し距離感のあるクラスメイトの姿を一人頭の中で強くイメージしてください。";
        qTitleEl.textContent = "Q. イメージしたそのクラスメイトと、普段どのくらい親しいですか？（1: 全く親しくない 〜 7: 非常に親しい）";
    }

    document.querySelectorAll('input[name="subjective_intimacy"]').forEach(el => el.checked = false);
    document.getElementById("step-instruction").classList.remove("hidden");
    window.scrollTo(0, 0);
}

function startBlockChat() {
    const intimacyRadio = document.querySelector('input[name="subjective_intimacy"]:checked');
    if (!intimacyRadio) {
        alert("親密度（1〜7）を選択してください。");
        return;
    }

    experimentData.subjectiveIntimacies[currentBlockSenderKey] = parseInt(intimacyRadio.value);

    document.getElementById("step-instruction").classList.add("hidden");
    document.getElementById("step-chat").classList.remove("hidden");
    window.scrollTo(0, 0);

    loadCurrentTrial();
}

function loadCurrentTrial() {
    const trial = trialQueue[currentTrialIndex];
    document.getElementById("sender-label").textContent = `送信者：${trial.roleName.split('（')[0]}`;
    
    const chatBody = document.getElementById("chat-body");
    chatBody.innerHTML = "";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble received";
    bubble.textContent = trial.messageText;
    chatBody.appendChild(bubble);

    messageDisplayTime = performance.now();
}

function handleNextFromMessage() {
    const readTimeMs = Math.round(performance.now() - messageDisplayTime);
    const currentTrial = trialQueue[currentTrialIndex];

    experimentData.trials[currentTrialIndex] = {
        sender_key: currentTrial.senderKey,
        role: currentTrial.roleName.split('（')[0],
        assigned_set: currentTrial.assignedSet,
        condition: currentTrial.condition,
        message_id: currentTrial.messageId,
        received_message: currentTrial.messageText,
        reply_length: 0,
        reply_time_ms: readTimeMs,
        has_emoji: "なし",
        emoji_count: 0,
        pattern_18: currentTrial.pattern_18,
        pattern_18_id: experimentData.pattern_18_id
    };

    document.getElementById("step-chat").classList.add("hidden");
    document.getElementById("step-evaluation").classList.remove("hidden");
    window.scrollTo(0, 0);
}

function submitEvaluation() {
    const impressionRadio = document.querySelector('input[name="impression"]:checked');
    const intentRadio = document.querySelector('input[name="intent"]:checked');

    if (!impressionRadio || !intentRadio) {
        alert("直感的な印象と意図の評価（1〜7）を両方選択してください。");
        return;
    }

    const freeComment = document.getElementById("free-comment").value;

    experimentData.trials[currentTrialIndex].impression = parseInt(impressionRadio.value);
    experimentData.trials[currentTrialIndex].intent_score = parseInt(intentRadio.value);
    experimentData.trials[currentTrialIndex].comment = freeComment;

    impressionRadio.checked = false;
    intentRadio.checked = false;
    document.getElementById("free-comment").value = "";

    currentTrialIndex++;

    if (currentTrialIndex < trialQueue.length) {
        const nextTrial = trialQueue[currentTrialIndex];
        document.getElementById("step-evaluation").classList.add("hidden");

        if (nextTrial.senderKey !== currentBlockSenderKey) {
            showBlockInstruction();
        } else {
            document.getElementById("step-chat").classList.remove("hidden");
            window.scrollTo(0, 0);
            loadCurrentTrial();
        }
    } else {
        document.getElementById("step-evaluation").classList.add("hidden");
        document.getElementById("step-post-survey").classList.remove("hidden");
        window.scrollTo(0, 0);
    }
}

function submitPostSurvey() {
    const emojiRadio = document.querySelector('input[name="emoji_usage"]:checked');
    if (!emojiRadio) {
        alert("現実の絵文字使用頻度を選択してください。");
        return;
    }

    experimentData.postSurvey = {
        freq_friend: document.getElementById("freq-friend").value,
        freq_classmate: document.getElementById("freq-classmate").value,
        freq_acquaintance: document.getElementById("freq-acquaintance").value,
        emoji_usage: parseInt(emojiRadio.value)
    };

    document.getElementById("step-post-survey").classList.add("hidden");
    document.getElementById("step-lsas").classList.remove("hidden");
    window.scrollTo(0, 0);
}

function finishExperiment() {
    let totalFear = 0;
    let totalAvoid = 0;

    for (let i = 0; i < lsasQuestions.length; i++) {
        totalFear += parseInt(document.getElementById(`lsas-fear-${i}`).value);
        totalAvoid += parseInt(document.getElementById(`lsas-avoid-${i}`).value);
    }

    experimentData.lsas = {
        fear: totalFear,
        avoid: totalAvoid,
        total: totalFear + totalAvoid
    };

    document.getElementById("step-lsas").classList.add("hidden");
    document.getElementById("step-thanks").classList.remove("hidden");
    window.scrollTo(0, 0);

    fetch(GAS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(experimentData)
    })
    .then(() => { console.log("データ送信成功"); })
    .catch((error) => { console.error("データ送信エラー:", error); });
}