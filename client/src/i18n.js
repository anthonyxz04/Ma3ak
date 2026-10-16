/* =========================================================
   LANGUAGES — English, العربية (right-to-left), Français.
   Interface text is translated on screen from the dictionary below, so every page,
   the builder and new screens stay translated as they change. To add or fix a
   translation, edit the table: [English, Arabic, French].
   ========================================================= */
const I18N = (() => {
  const T = [
    // site navigation
    ['Home','الرئيسية','Accueil'],['How It Works','كيف يعمل','Comment ça marche'],['Events','المناسبات','Événements'],['Vendors','مزوّدو الخدمات','Prestataires'],['About','من نحن','À propos'],['Contact','تواصل معنا','Contact'],
    ['For Vendors','للمزوّدين','Pour les prestataires'],['Create your event','صمّم مناسبتك','Créez votre événement'],['Explore','استكشف','Explorer'],['Sign in','تسجيل الدخول','Se connecter'],['My events','مناسباتي','Mes événements'],
    ['Search','بحث','Rechercher'],['Privacy Policy','سياسة الخصوصية','Politique de confidentialité'],['Terms','الشروط','Conditions'],['Built for events across Lebanon.','صُمّم للمناسبات في كل لبنان.','Conçu pour les événements partout au Liban.'],
    ['Language','اللغة','Langue'],['Menu','القائمة','Menu'],['Close','إغلاق','Fermer'],['Event Planner','مخطّط المناسبات','Planificateur'],
    // home
    ['Plan Your Event.','خطّط لمناسبتك.','Planifiez votre événement.'],['We’ll Help You Build It.','ونساعدك في تحقيقها.','Nous vous aidons à la réaliser.'],
    ['Tell us what you’re planning, your budget, and what you need. MA3AK connects you with event providers across Lebanon and helps you build your event in one place.','أخبرنا بما تخطّط له وميزانيتك وما تحتاجه. يربطك MA3AK بمزوّدي خدمات المناسبات في كل لبنان ويساعدك على بناء مناسبتك في مكان واحد.','Dites-nous ce que vous préparez, votre budget et vos besoins. MA3AK vous met en relation avec des prestataires partout au Liban et vous aide à construire votre événement en un seul endroit.'],
    ['Design it in 3D','صمّمها بالأبعاد الثلاثية','Concevez-le en 3D'],['Ask the AI assistant','اسأل المساعد الذكي','Demandez à l’assistant IA'],['Save, share, collaborate','احفظ، شارك، تعاون','Enregistrez, partagez, collaborez'],['Send it to us','أرسلها إلينا','Envoyez-le-nous'],
    ['Pick a venue, or upload a photo of your own, then add the stage, decor, lighting and effects and watch it appear.','اختر مكانًا أو حمّل صورة لمكانك، ثم أضف المسرح والديكور والإضاءة والمؤثرات وشاهدها تظهر أمامك.','Choisissez un lieu ou importez une photo du vôtre, puis ajoutez la scène, le décor, l’éclairage et les effets, et regardez-les apparaître.'],
    ['Get advice based on your actual event: guests, venue, style and budget.','احصل على نصائح مبنية على مناسبتك الفعلية: الضيوف والمكان والأسلوب والميزانية.','Des conseils basés sur votre événement réel : invités, lieu, style et budget.'],
    ['Your designs save automatically. Share a view-only link or invite someone to design with you.','تُحفظ تصاميمك تلقائيًا. شارك رابط عرض فقط أو ادعُ شخصًا ليصمّم معك.','Vos créations sont enregistrées automatiquement. Partagez un lien en lecture seule ou invitez quelqu’un à concevoir avec vous.'],
    ['When it’s ready, send your design and our team arranges it with the right providers.','عندما تجهز، أرسل تصميمك وسيرتّبه فريقنا مع المزوّدين المناسبين.','Quand c’est prêt, envoyez votre création et notre équipe l’organise avec les bons prestataires.'],
    ['Ask MA3AK AI','اسأل مساعد MA3AK','Demandez à l’IA MA3AK'],
    // accounts
    ['Welcome back','أهلًا بعودتك','Bon retour'],['Sign in to continue designing your events.','سجّل الدخول لمتابعة تصميم مناسباتك.','Connectez-vous pour continuer à concevoir vos événements.'],['Email','البريد الإلكتروني','E-mail'],['Password','كلمة المرور','Mot de passe'],
    ['Forgot your password?','نسيت كلمة المرور؟','Mot de passe oublié ?'],['Create an account','أنشئ حسابًا','Créer un compte'],['Create your free account','أنشئ حسابك المجاني','Créez votre compte gratuit'],['Save your designs, come back any time, and share them.','احفظ تصاميمك وعُد إليها في أي وقت وشاركها.','Enregistrez vos créations, revenez quand vous voulez et partagez-les.'],
    ['Your name','اسمك','Votre nom'],['Create account','إنشاء الحساب','Créer le compte'],['Continue with Google','المتابعة باستخدام Google','Continuer avec Google'],['or','أو','ou'],['Reset your password','إعادة تعيين كلمة المرور','Réinitialiser le mot de passe'],
    ['Send reset link','أرسل رابط إعادة التعيين','Envoyer le lien'],['Back to sign in','العودة لتسجيل الدخول','Retour à la connexion'],['At least 12 characters, with letters and numbers.','12 حرفًا على الأقل، مع أحرف وأرقام.','Au moins 12 caractères, avec des lettres et des chiffres.'],
    ['Create new event','مناسبة جديدة','Nouvel événement'],['Account','الحساب','Compte'],['Shared with me','تمت مشاركتها معي','Partagés avec moi'],['Favorites','المفضّلة','Favoris'],['Continue designing','متابعة التصميم','Continuer'],['Open','فتح','Ouvrir'],
    ['Design your first event','صمّم مناسبتك الأولى','Concevez votre premier événement'],['Date not set','لم يُحدَّد التاريخ','Date non définie'],['Sent to MA3AK','أُرسلت إلى MA3AK','Envoyé à MA3AK'],['Sign out','تسجيل الخروج','Se déconnecter'],['Profile','الملف الشخصي','Profil'],['Save profile','حفظ الملف','Enregistrer le profil'],
    // builder: categories and groups
    ['Event','المناسبة','Événement'],['Venue','المكان','Lieu'],['Guests','الضيوف','Invités'],['Style','الأسلوب','Style'],['Stage','المسرح','Scène'],['Decor','الديكور','Décor'],['Lights','الإضاءة','Lumières'],['Food','الطعام','Repas'],['Fun','الترفيه','Animations'],['Details','التفاصيل','Détails'],
    ['Invitation','الدعوة','Invitation'],['Guest list','قائمة الضيوف','Liste des invités'],['Timeline','البرنامج','Déroulé'],['Checklist','قائمة المهام','Check-list'],['Send','إرسال','Envoyer'],['All','الكل','Tout'],
    ['Setup','الأساسيات','Bases'],['Design','التصميم','Design'],['Plan','التخطيط','Organisation'],['Finish','الإنهاء','Finalisation'],['Collapse','طيّ','Réduire'],
    ['Setting','المكان','Cadre'],['Time','الوقت','Moment'],['Size','الحجم','Taille'],['Seating','الجلوس','Placement'],['Colors','الألوان','Couleurs'],['Theme','الطابع','Thème'],['Chairs','الكراسي','Chaises'],['Tables','الطاولات','Tables'],['Flowers','الزهور','Fleurs'],
    ['Stage & music','المسرح والموسيقى','Scène et musique'],['Dance floor','حلبة الرقص','Piste de danse'],['Lighting','الإضاءة','Éclairage'],['Effects','المؤثرات','Effets'],['Stations','المحطات','Stands'],['Cake','قالب الحلوى','Gâteau'],['Menu','قائمة الطعام','Menu'],['Drinks','المشروبات','Boissons'],
    ['When','متى','Quand'],['Music','الموسيقى','Musique'],['Photo','التصوير','Photo'],['Beauty','التجميل','Beauté'],['Extras','إضافات','Extras'],
    ['What are we celebrating?','بماذا نحتفل؟','Que célébrons-nous ?'],['Ready to send','جاهز للإرسال','Prêt à envoyer'],['Classic','كلاسيكي','Classique'],['Rare','نادر','Rare'],['Epic','مميّز','Épique'],['Legendary','أسطوري','Légendaire'],
    // builder: HUD, tools, menu
    ['Ask AI','اسأل الذكاء الاصطناعي','Demander à l’IA'],['Before','قبل','Avant'],['Previous','السابق','Précédent'],['score','النتيجة','score'],['Set budget','حدّد الميزانية','Définir le budget'],['budget','الميزانية','budget'],['est.','تقديري','est.'],['Whole venue','المكان كاملًا','Tout le lieu'],
    ['Saved','تم الحفظ','Enregistré'],['Saving…','جارٍ الحفظ…','Enregistrement…'],['Saved on this device','محفوظ على هذا الجهاز','Enregistré sur cet appareil'],['Not saved','لم يُحفظ','Non enregistré'],['Offline, will retry','غير متصل، ستتم المحاولة مجددًا','Hors ligne, nouvel essai bientôt'],
    ['Create my dream event','صمّم مناسبة أحلامي','Créer l’événement de mes rêves'],['Surprise me','فاجئني','Surprenez-moi'],['Inspiration gallery','معرض الإلهام','Galerie d’inspiration'],['Free preview mode','وضع المعاينة الحرّة','Aperçu libre'],['Share event','مشاركة المناسبة','Partager l’événement'],
    ['Version history','سجلّ النسخ','Historique des versions'],['Save as PDF','حفظ كملف PDF','Enregistrer en PDF'],['Save a 4K picture','حفظ صورة بدقة 4K','Enregistrer une image 4K'],['Reset layout to my choices','إعادة التوزيع حسب اختياراتي','Réinitialiser la disposition'],
    ['Realistic graphics','رسومات واقعية','Graphismes réalistes'],['Illustrated graphics','رسومات مرسومة','Graphismes illustrés'],['Front','أمامي','Face'],['Side','جانبي','Côté'],['Top','من الأعلى','Dessus'],['Guest view','منظور الضيف','Vue invité'],['Reset view','إعادة المنظر','Réinitialiser la vue'],
    ['Orbit','دوران','Orbite'],['Exit preview','إنهاء المعاينة','Quitter l’aperçu'],['Roll again','جرّب مجددًا','Relancer'],['Keep it','احتفظ به','Je garde'],['Back to design','العودة للتصميم','Retour au design'],['Replay','إعادة','Rejouer'],
    ['Event experience score','نتيجة تجربة المناسبة','Score d’expérience'],['Guests are arriving','الضيوف يصلون','Les invités arrivent'],['The room fills up','القاعة تمتلئ','La salle se remplit'],['Dinner is served','العشاء جاهز','Le dîner est servi'],['Lights down, music up','الأضواء تخفت والموسيقى ترتفع','Lumières tamisées, musique à fond'],['Peak party','ذروة الحفلة','La fête bat son plein'],
    ['Your event','مناسبتك','Votre événement'],['The stage','المسرح','La scène'],['What your guests will see','ما سيراه ضيوفك','Ce que verront vos invités'],['The full layout','التوزيع الكامل','Le plan complet'],
    ['Atmosphere','الأجواء','Ambiance'],['Guest experience','تجربة الضيوف','Expérience invités'],['Entertainment','الترفيه','Divertissement'],['Budget efficiency','كفاءة الميزانية','Efficacité budgétaire'],['Biggest improvements','أهم التحسينات','Améliorations prioritaires'],
    ['Pick a style','اختر الأسلوب','Choisissez un style'],['What atmosphere?','أي أجواء؟','Quelle ambiance ?'],['Where?','أين؟','Où ?'],['How many guests, and what budget?','كم ضيفًا وما الميزانية؟','Combien d’invités, et quel budget ?'],['Next','التالي','Suivant'],['Back','رجوع','Retour'],['Build my event','ابنِ مناسبتي','Construire mon événement'],['Not sure yet','لست متأكدًا بعد','Pas encore sûr'],
    ['Romantic','رومانسي','Romantique'],['Elegant','أنيق','Élégant'],['Party','حفلة','Fête'],['Afro House','أفرو هاوس','Afro House'],['Chill','هادئ','Détente'],['Traditional','تقليدي','Traditionnel'],['Luxury','فاخر','Luxe'],['Modern','عصري','Moderne'],['Minimal','بسيط','Minimaliste'],['Boho','بوهيمي','Bohème'],['Garden','حديقة','Jardin'],['Glam','براق','Glamour'],['Royal','ملكي','Royal'],
    ['Setting the venue','تجهيز المكان','Préparation du lieu'],['Placing tables and chairs','وضع الطاولات والكراسي','Mise en place des tables'],['Building the stage','بناء المسرح','Montage de la scène'],['Decorating','التزيين','Décoration'],['Lighting it up','تشغيل الإضاءة','Mise en lumière'],['Final touches','اللمسات الأخيرة','Touches finales'],
    ['seats','مقاعد','places'],['guests','ضيوف','invités'],['venue','المكان','lieu'],['space used','المساحة المستخدمة','espace utilisé'],['Day','نهار','Jour'],['Sunset','الغروب','Coucher de soleil'],['Night','ليل','Nuit'],
    // venues and event types
    ['Ballroom','قاعة','Salle de bal'],['Beach','شاطئ','Plage'],['Boat','قارب','Bateau'],['Rooftop','سطح','Rooftop'],['Villa','فيلا','Villa'],['Mountain resort','منتجع جبلي','Station de montagne'],['Tent','خيمة','Chapiteau'],['Vineyard','كرم','Vignoble'],['Palace','قصر','Palais'],['Restaurant','مطعم','Restaurant'],['Industrial loft','لوفت صناعي','Loft industriel'],
    ['Wedding','زفاف','Mariage'],['Engagement','خطوبة','Fiançailles'],['Birthday','عيد ميلاد','Anniversaire'],['Graduation','تخرّج','Remise de diplômes'],['Corporate Event','مناسبة شركات','Événement d’entreprise'],['Private Party','حفلة خاصة','Soirée privée'],['Baby Shower','حفل استقبال المولود','Baby shower'],
    ['Bachelor Party','حفلة العزوبية','Enterrement de vie de garçon'],['Bachelorette Party','حفلة العروس','Enterrement de vie de jeune fille'],['Beach Event','مناسبة على الشاطئ','Événement à la plage'],['Outdoor Event','مناسبة في الهواء الطلق','Événement en plein air'],['Other Celebration','احتفال آخر','Autre célébration'],
    // catalogue items
    ['DJ booth','منصّة الـDJ','Cabine DJ'],['Live band','فرقة حيّة','Groupe live'],['Kosha','كوشة','Kosha'],['Sweetheart table','طاولة العروسين','Table des mariés'],['Grand piano','بيانو كبير','Piano à queue'],['Dabke & zaffe','دبكة وزفّة','Dabké et zaffé'],['Sound system','نظام صوت','Sonorisation'],
    ['Flower wall','جدار زهور','Mur de fleurs'],['Floral arch','قوس زهور','Arche florale'],['Balloon arch','قوس بالونات','Arche de ballons'],['Neon sign','لافتة نيون','Enseigne néon'],['Draped backdrop','خلفية قماشية','Drapé de fond'],['Balloon clusters','باقات بالونات','Grappes de ballons'],['Welcome sign','لافتة ترحيب','Panneau de bienvenue'],
    ['Candles & lanterns','شموع وفوانيس','Bougies et lanternes'],['Gift table','طاولة الهدايا','Table des cadeaux'],['Patio heaters','مدافئ خارجية','Chauffages d’extérieur'],['Olive tree','شجرة زيتون','Olivier'],['Umbrella lounge','جلسة بمظلّة','Salon parasol'],
    ['Chandeliers','ثريّات','Lustres'],['String lights','أضواء معلّقة','Guirlandes lumineuses'],['Warm uplights','إضاءة دافئة','Éclairage chaud'],['Color uplights','إضاءة ملوّنة','Éclairage coloré'],['Moving lights','أضواء متحرّكة','Lyres motorisées'],['LED screen','شاشة LED','Écran LED'],['LED panels','ألواح LED','Panneaux LED'],
    ['Cold sparks','شرارات باردة','Étincelles froides'],['Confetti','قصاصات ملوّنة','Confettis'],['Low fog','ضباب منخفض','Fumée lourde'],['Bubbles','فقاعات','Bulles'],['Lasers','ليزر','Lasers'],['Flame jets','نافورات لهب','Jets de flammes'],['Balloon drop','إسقاط البالونات','Lâcher de ballons'],['Fireworks','ألعاب نارية','Feux d’artifice'],['Drone light show','عرض طائرات مضيئة','Spectacle de drones'],['Sky lanterns','فوانيس طائرة','Lanternes célestes'],
    ['Bar','بار','Bar'],['Buffet','بوفيه','Buffet'],['Live stations','محطات حيّة','Stands live'],['BBQ grill','شواء','Barbecue'],['Food truck','شاحنة طعام','Food truck'],['Sweets table','طاولة حلويات','Table de douceurs'],['Chocolate fountain','نافورة شوكولا','Fontaine de chocolat'],['Coffee corner','ركن القهوة','Coin café'],
    ['Photo booth','كشك تصوير','Photobooth'],['360 booth','كشك 360','Photobooth 360'],['Argileh lounge','جلسة أراكيل','Coin narguilé'],['Lounge set','جلسة استرخاء','Salon lounge'],['Kids’ play area','منطقة ألعاب الأطفال','Espace enfants'],['Lawn games','ألعاب العشب','Jeux de jardin'],['Casino table','طاولة كازينو','Table de casino'],['Live painter','رسّام مباشر','Peintre live'],['Classic car','سيارة كلاسيكية','Voiture de collection'],['Fire pit','موقد نار','Brasero'],
    // planning tools
    ['Save your event to plan the details','احفظ مناسبتك لتخطّط تفاصيلها','Enregistrez votre événement pour en planifier les détails'],['Create a free account','أنشئ حسابًا مجانيًا','Créer un compte gratuit'],['attending','حاضرون','présents'],['confirmed','مؤكَّد','confirmés'],['pending','بانتظار الرد','en attente'],['declined','اعتذروا','déclinés'],['no table','بلا طاولة','sans table'],
    ['Add','إضافة','Ajouter'],['Paste a list','الصق قائمة','Coller une liste'],['Confirmed','مؤكَّد','Confirmé'],['Pending','بانتظار الرد','En attente'],['Declined','اعتذر','Décliné'],['VIP','كبار الضيوف','VIP'],['No table','بلا طاولة','Sans table'],['Table','طاولة','Table'],
    ['Add a moment','أضف لحظة','Ajouter un moment'],['Create my checklist','أنشئ قائمة مهامي','Créer ma check-list'],['60+ days before','قبل 60 يومًا أو أكثر','60 jours avant ou plus'],['30 days before','قبل 30 يومًا','30 jours avant'],['7 days before','قبل 7 أيام','7 jours avant'],['Event day','يوم المناسبة','Jour J'],
    ['Save draft','حفظ كمسودة','Enregistrer le brouillon'],['Publish invitation','نشر الدعوة','Publier l’invitation'],['Update invitation','تحديث الدعوة','Mettre à jour l’invitation'],['Title','العنوان','Titre'],['Hosted by','بدعوة من','Organisé par'],['Date','التاريخ','Date'],['Where','المكان','Lieu'],['Message','الرسالة','Message'],['Dress code','قواعد اللباس','Code vestimentaire'],['Reply by','الرد قبل','Répondre avant le'],
    ['Guest name','اسم الضيف','Nom de l’invité'],['Group (e.g. Haddad family)','المجموعة (مثلًا عائلة حداد)','Groupe (ex. famille Haddad)'],['Drag to look around','اسحب لتتجوّل','Faites glisser pour explorer'],['Search all items','ابحث في كل العناصر','Rechercher tous les éléments'],
    ['Search DJ booth, flowers, LED, chairs…','ابحث: DJ، زهور، LED، كراسي…','Rechercher : DJ, fleurs, LED, chaises…'],['Nothing to undo','لا شيء للتراجع','Rien à annuler'],['Nothing to redo','لا شيء للإعادة','Rien à rétablir'],['Popular','الأكثر طلبًا','Populaire'],['New','جديد','Nouveau'],['Outdoor','في الهواء الطلق','Extérieur'],['Indoor','داخلي','Intérieur'],
    ['Copy','نسخ','Copier'],['Preview','معاينة','Aperçu'],['Turn off','إيقاف','Désactiver'],
    // invitation page
    ['You’re invited','أنت مدعو','Vous êtes invité'],['Will you join us?','هل ستنضم إلينا؟','Serez-vous des nôtres ?'],['Joyfully accept','أقبل بكل سرور','J’accepte avec joie'],['Regretfully decline','أعتذر بأسف','Je décline à regret'],['Phone (optional)','الهاتف (اختياري)','Téléphone (facultatif)'],
    ['I’m bringing a plus-one','سأحضر مرافقًا','Je viens accompagné'],['Dietary needs (optional)','احتياجات غذائية (اختياري)','Régime alimentaire (facultatif)'],['A note for the hosts (optional)','رسالة للمضيفين (اختياري)','Un mot pour les hôtes (facultatif)'],['Send my reply','أرسل ردّي','Envoyer ma réponse'],
    ['See you there!','نراك هناك!','À bientôt !'],['Thank you for letting us know','شكرًا لإعلامنا','Merci de nous avoir prévenus'],['Your reply was sent to the hosts.','وصل ردّك إلى المضيفين.','Votre réponse a été envoyée aux hôtes.'],['Replies are closed. Contact the hosts directly.','انتهت مهلة الرد. تواصل مع المضيفين مباشرة.','Les réponses sont closes. Contactez directement les hôtes.'],['Designed with','صُمّمت بواسطة','Conçu avec'],
    // send, vendors, assistant
    ['Phone / WhatsApp','الهاتف / واتساب','Téléphone / WhatsApp'],['Send my event design','أرسل تصميم مناسبتي','Envoyer mon design'],['optional','اختياري','facultatif'],['Add to my event','أضف إلى مناسبتي','Ajouter à mon événement'],['Request booking','اطلب حجزًا','Demander une réservation'],
    ['MA3AK assistant','مساعد MA3AK','Assistant MA3AK'],['Knows your current event','يعرف مناسبتك الحالية','Connaît votre événement'],['Ask about your event…','اسأل عن مناسبتك…','Posez une question sur votre événement…'],['Message us on WhatsApp','راسلنا على واتساب','Écrivez-nous sur WhatsApp'],['Your design is with us','وصلنا تصميمك','Nous avons reçu votre design'],
  ];
  const D = { ar:new Map(), fr:new Map() }; T.forEach(([en, ar, fr]) => { D.ar.set(en, ar); D.fr.set(en, fr); });
  const PAT = [[/^Next: (.+)$/, 'التالي: $1', 'Suivant : $1'], [/^Saved (\d+)s ago$/, 'حُفظ قبل $1 ث', 'Enregistré il y a $1 s'], [/^Saved (\d+) min ago$/, 'حُفظ قبل $1 د', 'Enregistré il y a $1 min'], [/^(.+) · Level (\d+)$/, '$1 · المستوى $2', '$1 · Niveau $2'], [/^(.+) design$/, 'تصميم $1', 'Design $1'], [/^Seat everyone \((\d+) per table\)$/, 'أجلِس الجميع ($1 لكل طاولة)', 'Placer tout le monde ($1 par table)'], [/^Undo: (.+)$/, 'تراجع: $1', 'Annuler : $1'], [/^Redo: (.+)$/, 'إعادة: $1', 'Rétablir : $1']];
  const LEVELS = { Sketch:['مسودة','Esquisse'], Concept:['فكرة','Concept'], Showcase:['عرض','Vitrine'], Grand:['فخم','Grandiose'], Masterpiece:['تحفة','Chef-d’œuvre'] };
  let lang = 'en'; try { lang = localStorage.getItem('ma3ak:lang') || ((navigator.language || '').startsWith('ar') ? 'ar' : (navigator.language || '').startsWith('fr') ? 'fr' : 'en'); } catch(e){}
  const idx = () => lang === 'ar' ? 1 : 2;
  const word = w => (LEVELS[w] ? LEVELS[w][idx() - 1] : D[lang].get(w)) || w;
  function tr(src){
    if (lang === 'en' || !src) return null; const k = src.trim(); if (!k || k.length > 400) return null;
    let t = D[lang].get(k);
    if (t == null) for (const p of PAT){ const m = k.match(p[0]); if (m){ t = p[idx()].replace('$1', /^\d+$/.test(m[1]) ? m[1] : word(m[1])).replace('$2', m[2] || ''); break; } }
    return t == null ? null : src.replace(k, t);
  }
  const ATTRS = ['placeholder','aria-label','title'];
  function apply(n){
    if (n.nodeType === 3){ const p = n.parentNode; if (!p || /^(SCRIPT|STYLE|TEXTAREA|OPTION)$/.test(p.nodeName) || (p.closest && p.closest('[data-noi18n]'))) return;
      if (n.__en === undefined || (n.__set !== undefined && n.nodeValue !== n.__set)) n.__en = n.nodeValue;
      const want = tr(n.__en) ?? n.__en; if (n.nodeValue !== want){ n.__set = want; n.nodeValue = want; } else n.__set = want; return; }
    if (n.nodeType !== 1 || n.closest('[data-noi18n]')) return;
    for (const a of ATTRS){ if (!n.hasAttribute(a)) continue; const cur = n.getAttribute(a), ek = '__en_' + a, sk = '__set_' + a;
      if (n[ek] === undefined || cur !== n[sk]) n[ek] = cur; const want = tr(n[ek]) ?? n[ek]; n[sk] = want; if (cur !== want) n.setAttribute(a, want); }
    for (const c of n.childNodes) apply(c);
  }
  let queue = new Set(), raf = 0;
  const flush = () => { raf = 0; const q = queue; queue = new Set(); q.forEach(n => { if (n.isConnected) apply(n); }); };
  const mo = new MutationObserver(ms => { for (const m of ms){ if (m.type === 'childList') m.addedNodes.forEach(n => queue.add(n)); else queue.add(m.target); } if (!raf) raf = requestAnimationFrame(flush); });
  function title(){ const t = document.title, i = t.lastIndexOf(' | '); if (i < 0 || lang === 'en') return; const head = t.slice(0, i), tt = tr(head); if (tt && tt !== head) document.title = tt + t.slice(i); }
  function set(l){
    lang = ['ar','fr'].includes(l) ? l : 'en'; try { localStorage.setItem('ma3ak:lang', lang); } catch(e){}
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    apply(document.body); title(); $$('[data-lang-cur]').forEach(b => { b.textContent = { en:'EN', ar:'ع', fr:'FR' }[lang]; });
  }
  function picker(){ openModal({ title:'Language', body:`<div class="lang-pick">${[['en','English'],['ar','العربية'],['fr','Français']].map(([k, l]) => `<button type="button" class="btn ${k === lang ? 'btn-primary' : 'btn-ghost'} btn-block" data-set-lang="${k}" data-noi18n>${l}</button>`).join('')}</div>
      <p class="small muted" style="margin-top:1rem" data-noi18n>${{ en:'Some long pages (About, legal) are in English.', ar:'بعض الصفحات الطويلة (من نحن، الشروط) متوفّرة بالإنجليزية.', fr:'Certaines pages longues (À propos, mentions légales) sont en anglais.' }[lang]}</p>`,
    onMount(m){ m.addEventListener('click', e => { const b = e.target.closest('[data-set-lang]'); if (b){ closeModal(); set(b.dataset.setLang); } }); } }); }
  document.addEventListener('click', e => { if (e.target.closest('[data-lang-open]')) picker(); });
  const start = () => { mo.observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATTRS }); set(lang);
    new MutationObserver(title).observe(document.querySelector('title'), { childList:true }); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  return { set, get lang(){ return lang; }, t:k => tr(k) ?? k, picker };
})();
