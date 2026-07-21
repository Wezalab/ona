export type Language = 'en' | 'fr' | 'sw' | 'ln';

export interface Translations {
  appName: string;
  continue: string;
  cancel: string;
  save: string;
  next: string;
  back: string;
  close: string;
  yes: string;
  no: string;
  loading: string;
  error: string;
  
  languageSelection: {
    title: string;
    subtitle: string;
    english: string;
    french: string;
    swahili: string;
    lingala: string;
  };
  
  welcome: {
    title: string;
    subtitle: string;
    description: string;
    getStarted: string;
  };
  
  consent: {
    title: string;
    disclaimer: string;
    purpose: string;
    dataPrivacy: string;
    voluntaryParticipation: string;
    iUnderstand: string;
    iAgree: string;
  };
  
  home: {
    title: string;
    newScreening: string;
    newScreeningDesc: string;
    history: string;
    historyDesc: string;
    settings: string;
    settingsDesc: string;
    about: string;
    aboutDesc: string;
    server: string;
    serverDesc: string;
    blockchain: string;
    blockchainDesc: string;
  };
  
  patientInfo: {
    title: string;
    subtitle: string;
    patientId: string;
    patientIdPlaceholder: string;
    age: string;
    agePlaceholder: string;
    gender: string;
    male: string;
    female: string;
    other: string;
    notes: string;
    notesPlaceholder: string;
    startScreening: string;
  };
  
  visualAcuity: {
    calibrationTitle: string;
    calibrationInstructions: string;
    placeCardInstruction: string;
    cardPlaced: string;
    testTitle: string;
    testInstructions: string;
    coverEye: string;
    whichWayPoints: string;
    up: string;
    down: string;
    left: string;
    right: string;
    cantSee: string;
    nextEye: string;
    complete: string;
  };
  
  eyeImage: {
    captureTitle: string;
    captureInstructions: string;
    goodLighting: string;
    holdSteady: string;
    openEyeWide: string;
    capturePhoto: string;
    retake: string;
    usePhoto: string;
    qualityCheck: string;
    qualityGood: string;
    qualityPoor: string;
    qualityPoorReason: string;
  };
  
  aiProcessing: {
    title: string;
    analyzing: string;
    subtitle: string;
  };
  
  results: {
    title: string;
    visualAcuityResults: string;
    eyeImageResults: string;
    rightEye: string;
    leftEye: string;
    riskLow: string;
    riskMedium: string;
    riskHigh: string;
    referralNeeded: string;
    referralAdvice: string;
    lowRiskAdvice: string;
    mediumRiskAdvice: string;
    highRiskAdvice: string;
    saveAndFinish: string;
  };
  
  history: {
    title: string;
    noScreenings: string;
    screening: string;
    patient: string;
    date: string;
    view: string;
  };
  
  settings: {
    title: string;
    language: string;
    dataSync: string;
    syncNow: string;
    lastSync: string;
    never: string;
    clearData: string;
    clearDataConfirm: string;
  };
  
  about: {
    title: string;
    version: string;
    disclaimer: string;
    disclaimerText: string;
    purpose: string;
    purposeText: string;
    limitations: string;
    limitationsText: string;
    contact: string;
  };

  apiSettings: {
    title: string;
    subtitle: string;
    serverUrl: string;
    email: string;
    password: string;
    login: string;
    logout: string;
    loggedInAs: string;
    selectClinic: string;
    loadClinics: string;
    clinicSelected: string;
    noClinic: string;
    pendingSync: string;
    syncNow: string;
    loginRequired: string;
  };

  blockchain: {
    title: string;
    subtitle: string;
    network: string;
    connecting: string;
    contract: string;
    pending: string;
    anchored: string;
    onChainTotal: string;
    privacy: string;
    proofs: string;
    empty: string;
    loadDemo: string;
    anchorToStarknet: string;
    anchoring: string;
    viewOnVoyager: string;
    refresh: string;
    backHome: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'ONA',
    continue: 'Continue',
    cancel: 'Cancel',
    save: 'Save',
    next: 'Next',
    back: 'Back',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    error: 'Error',
    
    languageSelection: {
      title: 'Choose Language',
      subtitle: 'Select your preferred language',
      english: 'English',
      french: 'French',
      swahili: 'Swahili',
      lingala: 'Lingala',
    },
    
    welcome: {
      title: 'Welcome to ONA',
      subtitle: 'Eye Health Screening Tool',
      description: 'This application helps community health workers perform basic visual screenings. It works entirely offline and preserves privacy.',
      getStarted: 'Get Started',
    },
    
    consent: {
      title: 'Consent and Information',
      disclaimer: 'IMPORTANT MEDICAL NOTICE',
      purpose: 'Purpose',
      dataPrivacy: 'Data Privacy',
      voluntaryParticipation: 'Voluntary Participation',
      iUnderstand: 'I Understand',
      iAgree: 'I Agree to Continue',
    },
    
    home: {
      title: 'Home',
      newScreening: 'New Screening',
      newScreeningDesc: 'Start a new visual screening',
      history: 'History',
      historyDesc: 'View previous screenings',
      settings: 'Settings',
      settingsDesc: 'Language, data and settings',
      about: 'About',
      aboutDesc: 'Information and safety warnings',
      server: 'ONA Server',
      serverDesc: 'Sign in, choose a clinic and sync data',
      blockchain: 'Blockchain',
      blockchainDesc: 'Anonymized impact proofs on Starknet',
    },
    
    patientInfo: {
      title: 'Patient Information',
      subtitle: 'Record basic information (optional)',
      patientId: 'Patient ID',
      patientIdPlaceholder: 'E.g: P001 (optional)',
      age: 'Age',
      agePlaceholder: 'Age in years',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      notes: 'Notes',
      notesPlaceholder: 'Observations or notes',
      startScreening: 'Start Screening',
    },
    
    visualAcuity: {
      calibrationTitle: 'Calibration',
      calibrationInstructions: 'Use a standard bank card to calibrate the display size',
      placeCardInstruction: 'Place a bank card on the rectangle below',
      cardPlaced: 'Card Placed',
      testTitle: 'Visual Acuity Test',
      testInstructions: 'Hold the phone at 40 cm. Patient must cover one eye.',
      coverEye: 'Cover Eye',
      whichWayPoints: 'Which way does the E point?',
      up: 'Up',
      down: 'Down',
      left: 'Left',
      right: 'Right',
      cantSee: 'Cannot See',
      nextEye: 'Next Eye',
      complete: 'Test Complete',
    },
    
    eyeImage: {
      captureTitle: 'Eye Image Capture',
      captureInstructions: 'Take a clear photo of the patient\'s eye',
      goodLighting: 'Good lighting',
      holdSteady: 'Hold steady',
      openEyeWide: 'Eye wide open',
      capturePhoto: 'Capture Photo',
      retake: 'Retake',
      usePhoto: 'Use Photo',
      qualityCheck: 'Quality Check',
      qualityGood: 'Quality good',
      qualityPoor: 'Quality insufficient',
      qualityPoorReason: 'Image blurry or poorly lit. Please retake.',
    },
    
    aiProcessing: {
      title: 'Analyzing',
      analyzing: 'Analyzing image...',
      subtitle: 'On-device processing (offline)',
    },
    
    results: {
      title: 'Screening Results',
      visualAcuityResults: 'Visual Acuity',
      eyeImageResults: 'Image Analysis',
      rightEye: 'Right Eye',
      leftEye: 'Left Eye',
      riskLow: 'Low Risk',
      riskMedium: 'Medium Risk',
      riskHigh: 'High Risk',
      referralNeeded: 'Referral Recommended',
      referralAdvice: 'Referral Advice',
      lowRiskAdvice: 'No urgent referral needed. Routine examination recommended.',
      mediumRiskAdvice: 'Referral recommended to qualified health worker for evaluation.',
      highRiskAdvice: 'URGENT REFERRAL needed to ophthalmologist or eye clinic.',
      saveAndFinish: 'Save and Finish',
    },
    
    history: {
      title: 'Screening History',
      noScreenings: 'No screenings recorded',
      screening: 'Screening',
      patient: 'Patient',
      date: 'Date',
      view: 'View',
    },
    
    settings: {
      title: 'Settings',
      language: 'Language',
      dataSync: 'Data Synchronization',
      syncNow: 'Sync Now',
      lastSync: 'Last sync',
      never: 'Never',
      clearData: 'Clear all data',
      clearDataConfirm: 'Are you sure? This will delete all saved screenings.',
    },
    
    about: {
      title: 'About',
      version: 'Version',
      disclaimer: 'Important Notice',
      disclaimerText: 'This application is a SCREENING TOOL ONLY. It does not provide medical diagnosis or treatment. All results must be confirmed by a qualified health professional.',
      purpose: 'Purpose',
      purposeText: 'To help community health workers identify individuals who may need professional eye evaluation.',
      limitations: 'Limitations',
      limitationsText: 'Does not detect all eye conditions. Does not replace professional examination. Results are indicative only.',
      contact: 'Contact and Support',
    },

    apiSettings: {
      title: 'ONA Server',
      subtitle: 'Connect to the ONA backend to sync screenings',
      serverUrl: 'Server URL',
      email: 'Email',
      password: 'Password',
      login: 'Sign In',
      logout: 'Sign Out',
      loggedInAs: 'Signed in as',
      selectClinic: 'Select clinic',
      loadClinics: 'Load clinics',
      clinicSelected: 'Selected clinic',
      noClinic: 'None',
      pendingSync: 'Pending sync',
      syncNow: 'Sync Now',
      loginRequired: 'Sign in and select a clinic to sync screenings.',
    },

    blockchain: {
      title: 'Blockchain',
      subtitle: 'Anonymized impact proofs anchored on Starknet',
      network: 'Network',
      connecting: 'Connecting…',
      contract: 'Contract',
      pending: 'Pending',
      anchored: 'Anchored',
      onChainTotal: 'On-chain total',
      privacy: 'Only anonymized cryptographic proofs are stored on-chain. No patient data ever leaves the device.',
      proofs: 'Proof queue',
      empty: 'No proofs yet',
      loadDemo: 'Load demo proofs',
      anchorToStarknet: 'Anchor to Starknet',
      anchoring: 'Anchoring…',
      viewOnVoyager: 'View on Voyager',
      refresh: 'Refresh',
      backHome: 'Back to Home',
    },
  },
  fr: {
    appName: 'ONA',
    continue: 'Continuer',
    cancel: 'Annuler',
    save: 'Sauvegarder',
    next: 'Suivant',
    back: 'Retour',
    close: 'Fermer',
    yes: 'Oui',
    no: 'Non',
    loading: 'Chargement...',
    error: 'Erreur',
    
    languageSelection: {
      title: 'Choisir la langue',
      subtitle: 'Sélectionnez votre langue préférée',
      english: 'Anglais',
      french: 'Français',
      swahili: 'Kiswahili',
      lingala: 'Lingala',
    },
    
    welcome: {
      title: 'Bienvenue à ONA',
      subtitle: 'Outil de dépistage pour la santé oculaire',
      description: 'Cette application aide les agents de santé communautaire à effectuer des dépistages visuels de base. Elle fonctionne entièrement hors ligne et préserve la confidentialité.',
      getStarted: 'Commencer',
    },
    
    consent: {
      title: 'Consentement et Information',
      disclaimer: 'AVIS MÉDICAL IMPORTANT',
      purpose: 'Objectif',
      dataPrivacy: 'Confidentialité des données',
      voluntaryParticipation: 'Participation volontaire',
      iUnderstand: 'Je comprends',
      iAgree: 'J\'accepte de continuer',
    },
    
    home: {
      title: 'Accueil',
      newScreening: 'Nouveau Dépistage',
      newScreeningDesc: 'Commencer un nouveau dépistage visuel',
      history: 'Historique',
      historyDesc: 'Voir les dépistages précédents',
      settings: 'Paramètres',
      settingsDesc: 'Langue, données et paramètres',
      about: 'À propos',
      aboutDesc: 'Informations et avertissements de sécurité',
      server: 'Serveur ONA',
      serverDesc: 'Se connecter, choisir une clinique et synchroniser',
      blockchain: 'Blockchain',
      blockchainDesc: 'Preuves d\'impact anonymisées sur Starknet',
    },
    
    patientInfo: {
      title: 'Information du Patient',
      subtitle: 'Enregistrer les informations de base (optionnel)',
      patientId: 'Code Patient',
      patientIdPlaceholder: 'Ex: P001 (optionnel)',
      age: 'Âge',
      agePlaceholder: 'Âge en années',
      gender: 'Genre',
      male: 'Homme',
      female: 'Femme',
      other: 'Autre',
      notes: 'Notes',
      notesPlaceholder: 'Observations ou notes',
      startScreening: 'Commencer le Dépistage',
    },
    
    visualAcuity: {
      calibrationTitle: 'Calibration',
      calibrationInstructions: 'Utilisez une carte bancaire standard pour calibrer la taille d\'affichage',
      placeCardInstruction: 'Placez une carte bancaire sur le rectangle ci-dessous',
      cardPlaced: 'Carte Placée',
      testTitle: 'Test d\'Acuité Visuelle',
      testInstructions: 'Tenez le téléphone à 40 cm. Le patient doit couvrir un œil.',
      coverEye: 'Couvrir l\'œil',
      whichWayPoints: 'Dans quelle direction pointe le E?',
      up: 'Haut',
      down: 'Bas',
      left: 'Gauche',
      right: 'Droite',
      cantSee: 'Ne Voit Pas',
      nextEye: 'Œil Suivant',
      complete: 'Test Terminé',
    },
    
    eyeImage: {
      captureTitle: 'Capture d\'Image de l\'Œil',
      captureInstructions: 'Prenez une photo claire de l\'œil du patient',
      goodLighting: 'Bon éclairage',
      holdSteady: 'Tenir stable',
      openEyeWide: 'Œil bien ouvert',
      capturePhoto: 'Prendre Photo',
      retake: 'Reprendre',
      usePhoto: 'Utiliser',
      qualityCheck: 'Vérification de qualité',
      qualityGood: 'Qualité bonne',
      qualityPoor: 'Qualité insuffisante',
      qualityPoorReason: 'Image floue ou mal éclairée. Veuillez reprendre.',
    },
    
    aiProcessing: {
      title: 'Analyse en cours',
      analyzing: 'Analyse de l\'image...',
      subtitle: 'Traitement sur l\'appareil (hors ligne)',
    },
    
    results: {
      title: 'Résultats du Dépistage',
      visualAcuityResults: 'Acuité Visuelle',
      eyeImageResults: 'Analyse d\'Image',
      rightEye: 'Œil Droit',
      leftEye: 'Œil Gauche',
      riskLow: 'Risque Faible',
      riskMedium: 'Risque Moyen',
      riskHigh: 'Risque Élevé',
      referralNeeded: 'Référence Recommandée',
      referralAdvice: 'Conseil de Référence',
      lowRiskAdvice: 'Aucune référence urgente nécessaire. Examen de routine recommandé.',
      mediumRiskAdvice: 'Référence recommandée à un agent de santé qualifié pour évaluation.',
      highRiskAdvice: 'RÉFÉRENCE URGENTE nécessaire à un ophtalmologiste ou une clinique oculaire.',
      saveAndFinish: 'Sauvegarder et Terminer',
    },
    
    history: {
      title: 'Historique des Dépistages',
      noScreenings: 'Aucun dépistage enregistré',
      screening: 'Dépistage',
      patient: 'Patient',
      date: 'Date',
      view: 'Voir',
    },
    
    settings: {
      title: 'Paramètres',
      language: 'Langue',
      dataSync: 'Synchronisation des Données',
      syncNow: 'Synchroniser Maintenant',
      lastSync: 'Dernière sync',
      never: 'Jamais',
      clearData: 'Effacer toutes les données',
      clearDataConfirm: 'Êtes-vous sûr? Cela supprimera tous les dépistages enregistrés.',
    },
    
    about: {
      title: 'À Propos',
      version: 'Version',
      disclaimer: 'Avis Important',
      disclaimerText: 'Cette application est un OUTIL DE DÉPISTAGE UNIQUEMENT. Elle ne fournit pas de diagnostic médical ou de traitement. Tous les résultats doivent être confirmés par un professionnel de santé qualifié.',
      purpose: 'Objectif',
      purposeText: 'Aider les agents de santé communautaire à identifier les personnes qui peuvent nécessiter une évaluation oculaire professionnelle.',
      limitations: 'Limitations',
      limitationsText: 'Ne détecte pas toutes les conditions oculaires. Ne remplace pas un examen professionnel. Les résultats sont indicatifs uniquement.',
      contact: 'Contact et Support',
    },

    apiSettings: {
      title: 'Serveur ONA',
      subtitle: 'Se connecter au serveur ONA pour synchroniser les dépistages',
      serverUrl: 'URL du serveur',
      email: 'E-mail',
      password: 'Mot de passe',
      login: 'Se connecter',
      logout: 'Se déconnecter',
      loggedInAs: 'Connecté en tant que',
      selectClinic: 'Choisir une clinique',
      loadClinics: 'Charger les cliniques',
      clinicSelected: 'Clinique sélectionnée',
      noClinic: 'Aucune',
      pendingSync: 'En attente de synchronisation',
      syncNow: 'Synchroniser Maintenant',
      loginRequired: 'Connectez-vous et choisissez une clinique pour synchroniser.',
    },

    blockchain: {
      title: 'Blockchain',
      subtitle: 'Preuves d\'impact anonymisées ancrées sur Starknet',
      network: 'Réseau',
      connecting: 'Connexion…',
      contract: 'Contrat',
      pending: 'En attente',
      anchored: 'Ancrées',
      onChainTotal: 'Total sur la chaîne',
      privacy: 'Seules des preuves cryptographiques anonymisées sont stockées sur la chaîne. Aucune donnée patient ne quitte l\'appareil.',
      proofs: 'File de preuves',
      empty: 'Aucune preuve pour le moment',
      loadDemo: 'Charger des preuves de démo',
      anchorToStarknet: 'Ancrer sur Starknet',
      anchoring: 'Ancrage…',
      viewOnVoyager: 'Voir sur Voyager',
      refresh: 'Actualiser',
      backHome: 'Retour à l\'accueil',
    },
  },
  
  sw: {
    appName: 'ONA',
    continue: 'Endelea',
    cancel: 'Ghairi',
    save: 'Hifadhi',
    next: 'Ifuatayo',
    back: 'Rudi',
    close: 'Funga',
    yes: 'Ndiyo',
    no: 'Hapana',
    loading: 'Inapakia...',
    error: 'Hitilafu',
    
    languageSelection: {
      title: 'Chagua Lugha',
      subtitle: 'Chagua lugha yako unayopendelea',
      english: 'Kingereza',
      french: 'Kifaransa',
      swahili: 'Kiswahili',
      lingala: 'Lingala',
    },
    
    welcome: {
      title: 'Karibu kwenye ONA',
      subtitle: 'Zana ya uchunguzi wa afya ya macho',
      description: 'Programu hii inasaidia wafanyakazi wa afya ya jamii kufanya uchunguzi wa msingi wa macho. Inafanya kazi kabisa bila mtandao na inahifadhi faragha.',
      getStarted: 'Anza',
    },
    
    consent: {
      title: 'Idhini na Taarifa',
      disclaimer: 'ONYO MUHIMU LA KITIBA',
      purpose: 'Madhumuni',
      dataPrivacy: 'Faragha ya Data',
      voluntaryParticipation: 'Ushiriki wa Hiari',
      iUnderstand: 'Naelewa',
      iAgree: 'Ninakubali kuendelea',
    },
    
    home: {
      title: 'Nyumbani',
      newScreening: 'Uchunguzi Mpya',
      newScreeningDesc: 'Anza uchunguzi mpya wa macho',
      history: 'Historia',
      historyDesc: 'Angalia uchunguzi uliopita',
      settings: 'Mipangilio',
      settingsDesc: 'Lugha, data na mipangilio',
      about: 'Kuhusu',
      aboutDesc: 'Taarifa na tahadhari za usalama',
      server: 'Seva ya ONA',
      serverDesc: 'Ingia, chagua kliniki na sawazisha data',
      blockchain: 'Blockchain',
      blockchainDesc: 'Uthibitisho wa athari usiojulikana kwenye Starknet',
    },
    
    patientInfo: {
      title: 'Taarifa za Mgonjwa',
      subtitle: 'Rekodi taarifa za msingi (si lazima)',
      patientId: 'Nambari ya Mgonjwa',
      patientIdPlaceholder: 'Mfano: P001 (si lazima)',
      age: 'Umri',
      agePlaceholder: 'Umri kwa miaka',
      gender: 'Jinsia',
      male: 'Mwanaume',
      female: 'Mwanamke',
      other: 'Nyingine',
      notes: 'Maelezo',
      notesPlaceholder: 'Uchunguzi au maelezo',
      startScreening: 'Anza Uchunguzi',
    },
    
    visualAcuity: {
      calibrationTitle: 'Usawazishaji',
      calibrationInstructions: 'Tumia kadi ya benki ya kawaida kusawazisha ukubwa wa onyesho',
      placeCardInstruction: 'Weka kadi ya benki kwenye mstatili hapa chini',
      cardPlaced: 'Kadi Imewekwa',
      testTitle: 'Jaribio la Uangavu wa Kuona',
      testInstructions: 'Shikilia simu umbali wa sm 40. Mgonjwa lazima afunike jicho moja.',
      coverEye: 'Funika Jicho',
      whichWayPoints: 'E inaelekea upande gani?',
      up: 'Juu',
      down: 'Chini',
      left: 'Kushoto',
      right: 'Kulia',
      cantSee: 'Haoni',
      nextEye: 'Jicho Lifuatalo',
      complete: 'Jaribio Limemalizika',
    },
    
    eyeImage: {
      captureTitle: 'Piga Picha ya Jicho',
      captureInstructions: 'Piga picha wazi ya jicho la mgonjwa',
      goodLighting: 'Mwanga mzuri',
      holdSteady: 'Shikilia imara',
      openEyeWide: 'Jicho limefunguka vizuri',
      capturePhoto: 'Piga Picha',
      retake: 'Rudia',
      usePhoto: 'Tumia',
      qualityCheck: 'Ukaguzi wa Ubora',
      qualityGood: 'Ubora mzuri',
      qualityPoor: 'Ubora si wa kutosha',
      qualityPoorReason: 'Picha si wazi au mwanga si mzuri. Tafadhali rudia.',
    },
    
    aiProcessing: {
      title: 'Inachambua',
      analyzing: 'Inachambua picha...',
      subtitle: 'Usindikaji kwenye kifaa (bila mtandao)',
    },
    
    results: {
      title: 'Matokeo ya Uchunguzi',
      visualAcuityResults: 'Uangavu wa Kuona',
      eyeImageResults: 'Uchambuzi wa Picha',
      rightEye: 'Jicho la Kulia',
      leftEye: 'Jicho la Kushoto',
      riskLow: 'Hatari Ndogo',
      riskMedium: 'Hatari ya Kati',
      riskHigh: 'Hatari Kubwa',
      referralNeeded: 'Rufaa Inapendekezwa',
      referralAdvice: 'Ushauri wa Rufaa',
      lowRiskAdvice: 'Hakuna rufaa ya dharura inahitajika. Uchunguzi wa kawaida unapendekezwa.',
      mediumRiskAdvice: 'Rufaa inapendekezwa kwa mfanyakazi wa afya aliye na sifa kwa tathmini.',
      highRiskAdvice: 'RUFAA YA DHARURA inahitajika kwa daktari wa macho au kliniki ya macho.',
      saveAndFinish: 'Hifadhi na Maliza',
    },
    
    history: {
      title: 'Historia ya Uchunguzi',
      noScreenings: 'Hakuna uchunguzi uliotunzwa',
      screening: 'Uchunguzi',
      patient: 'Mgonjwa',
      date: 'Tarehe',
      view: 'Angalia',
    },
    
    settings: {
      title: 'Mipangilio',
      language: 'Lugha',
      dataSync: 'Usawazishaji wa Data',
      syncNow: 'Sawazisha Sasa',
      lastSync: 'Usawazishaji wa mwisho',
      never: 'Kamwe',
      clearData: 'Futa data zote',
      clearDataConfirm: 'Una uhakika? Hii itafuta uchunguzi wote uliohifadhiwa.',
    },
    
    about: {
      title: 'Kuhusu',
      version: 'Toleo',
      disclaimer: 'Onyo Muhimu',
      disclaimerText: 'Programu hii ni ZANA YA UCHUNGUZI TU. Haitoi utambuzi wa kitiba au matibabu. Matokeo yote lazima yathibitishwe na mtaalamu wa afya aliye na sifa.',
      purpose: 'Madhumuni',
      purposeText: 'Kusaidia wafanyakazi wa afya ya jamii kutambua watu ambao wanaweza kuhitaji tathmini ya kitaalamu ya macho.',
      limitations: 'Mipaka',
      limitationsText: 'Haitambui hali zote za macho. Haichukui nafasi ya uchunguzi wa kitaalamu. Matokeo ni ya mwongozo tu.',
      contact: 'Mawasiliano na Msaada',
    },

    apiSettings: {
      title: 'Seva ya ONA',
      subtitle: 'Unganisha kwenye seva ya ONA kusawazisha uchunguzi',
      serverUrl: 'URL ya seva',
      email: 'Barua pepe',
      password: 'Nywila',
      login: 'Ingia',
      logout: 'Toka',
      loggedInAs: 'Umeingia kama',
      selectClinic: 'Chagua kliniki',
      loadClinics: 'Pakia kliniki',
      clinicSelected: 'Kliniki iliyochaguliwa',
      noClinic: 'Hakuna',
      pendingSync: 'Inasubiri kusawazishwa',
      syncNow: 'Sawazisha Sasa',
      loginRequired: 'Ingia na uchague kliniki ili kusawazisha uchunguzi.',
    },

    blockchain: {
      title: 'Blockchain',
      subtitle: 'Uthibitisho wa athari usiojulikana uliohifadhiwa kwenye Starknet',
      network: 'Mtandao',
      connecting: 'Inaunganisha…',
      contract: 'Mkataba',
      pending: 'Inasubiri',
      anchored: 'Imehifadhiwa',
      onChainTotal: 'Jumla kwenye chain',
      privacy: 'Uthibitisho wa siri usiojulikana pekee ndio unaohifadhiwa kwenye chain. Hakuna data ya mgonjwa inayotoka kwenye kifaa.',
      proofs: 'Foleni ya uthibitisho',
      empty: 'Hakuna uthibitisho bado',
      loadDemo: 'Pakia uthibitisho wa demo',
      anchorToStarknet: 'Hifadhi kwenye Starknet',
      anchoring: 'Inahifadhi…',
      viewOnVoyager: 'Angalia kwenye Voyager',
      refresh: 'Onyesha upya',
      backHome: 'Rudi Nyumbani',
    },
  },
  
  ln: {
    appName: 'ONA',
    continue: 'Koba',
    cancel: 'Koboya',
    save: 'Kobomba',
    next: 'Oyo Elandaka',
    back: 'Zonga',
    close: 'Kanga',
    yes: 'Iyo',
    no: 'Te',
    loading: 'Ezali kotia...',
    error: 'Libunga',
    
    languageSelection: {
      title: 'Pona Monoko',
      subtitle: 'Pona monoko oyo olingi',
      english: 'Angele',
      french: 'Falanse',
      swahili: 'Swahili',
      lingala: 'Lingala',
    },
    
    welcome: {
      title: 'Boyambi na ONA',
      subtitle: 'Esaleli ya botalisi ya bokolongono ya miso',
      description: 'Programme oyo esalisaka basali ya bokolongono ya libota basala botalisi ya ntina ya miso. Esalaka nionso na internet te mpe ebatelaka sekele.',
      getStarted: 'Kobanda',
    },
    
    consent: {
      title: 'Bondimi mpe Sango',
      disclaimer: 'KEBA MONENE YA MONGANGA',
      purpose: 'Ntina',
      dataPrivacy: 'Kobatela ya Makambo',
      voluntaryParticipation: 'Bondimi ya Molimo',
      iUnderstand: 'Nasosolaki',
      iAgree: 'Nandimi kokoba',
    },
    
    home: {
      title: 'Ndako',
      newScreening: 'Botalisi Sika',
      newScreeningDesc: 'Kobanda botalisi sika ya miso',
      history: 'Likambo ya Kala',
      historyDesc: 'Kotala botalisi ya liboso',
      settings: 'Mabongisi',
      settingsDesc: 'Monoko, makambo mpe mabongisi',
      about: 'Na Ntina Ya',
      aboutDesc: 'Sango mpe makebisi ya libateli',
      server: 'Serveur ONA',
      serverDesc: 'Kokota, pona kliniki mpe kosala boyokani',
      blockchain: 'Blockchain',
      blockchainDesc: 'Bilembo ya bopusi oyo eyebani te na Starknet',
    },
    
    patientInfo: {
      title: 'Sango ya Mobeli',
      subtitle: 'Kokoma sango ya ntina (esengeli te)',
      patientId: 'Kode ya Mobeli',
      patientIdPlaceholder: 'Ndakisa: P001 (esengeli te)',
      age: 'Mbula',
      agePlaceholder: 'Mbula ya mbotama',
      gender: 'Libota',
      male: 'Mobali',
      female: 'Mwasi',
      other: 'Mosusu',
      notes: 'Maloba',
      notesPlaceholder: 'Botalisi to maloba',
      startScreening: 'Kobanda Botalisi',
    },
    
    visualAcuity: {
      calibrationTitle: 'Kobongisa',
      calibrationInstructions: 'Salelá carte ya banque ya normal pona kobongisa bonene ya moniseli',
      placeCardInstruction: 'Tyá carte ya banque likolo ya rectangle oyo ezali na nse',
      cardPlaced: 'Carte Etyami',
      testTitle: 'Komeka Komona Malamu',
      testInstructions: 'Simba telefone na cm 40. Mobeli asengeli kofunda liso moko.',
      coverEye: 'Kofunda Liso',
      whichWayPoints: 'E ezali kotatola epai nini?',
      up: 'Likolo',
      down: 'Na Nse',
      left: 'Na Ngambo ya Mwasi',
      right: 'Na Ngambo ya Mobali',
      cantSee: 'Amonaka Te',
      nextEye: 'Liso Elandaki',
      complete: 'Komeka Esilaki',
    },
    
    eyeImage: {
      captureTitle: 'Kokanga Elilingi ya Liso',
      captureInstructions: 'Kanga elilingi ya polele ya liso ya mobeli',
      goodLighting: 'Pole malamu',
      holdSteady: 'Simba makasi',
      openEyeWide: 'Liso efungwami malamu',
      capturePhoto: 'Kanga Elilingi',
      retake: 'Zongela',
      usePhoto: 'Salelá',
      qualityCheck: 'Botalisi ya Bolamu',
      qualityGood: 'Bolamu malamu',
      qualityPoor: 'Bolamu ekoki te',
      qualityPoorReason: 'Elilingi ezali polele te to pole ezali malamu te. Zongela.',
    },
    
    aiProcessing: {
      title: 'Botalisi ekomi',
      analyzing: 'Botalisi ya elilingi...',
      subtitle: 'Mosala na aparey (na internet te)',
    },
    
    results: {
      title: 'Mbano ya Botalisi',
      visualAcuityResults: 'Komona Malamu',
      eyeImageResults: 'Botalisi ya Elilingi',
      rightEye: 'Liso ya Mobali',
      leftEye: 'Liso ya Mwasi',
      riskLow: 'Likama Moke',
      riskMedium: 'Likama ya Kati',
      riskHigh: 'Likama Monene',
      referralNeeded: 'Kotinda Epesami Likanisi',
      referralAdvice: 'Toli ya Kotinda',
      lowRiskAdvice: 'Kotinda ya nokinoki esengeli te. Botalisi ya momeseno epesami likanisi.',
      mediumRiskAdvice: 'Kotinda epesami likanisi na mosali ya bokolongono oyo azali na mayele pona komeka.',
      highRiskAdvice: 'KOTINDA YA NOKINOKI esengeli na monganga ya miso to kliniki ya miso.',
      saveAndFinish: 'Kobomba pe Kosilisa',
    },
    
    history: {
      title: 'Likambo ya Botalisi',
      noScreenings: 'Botalisi ya kobomba ezali te',
      screening: 'Botalisi',
      patient: 'Mobeli',
      date: 'Mokolo',
      view: 'Tala',
    },
    
    settings: {
      title: 'Mabongisi',
      language: 'Monoko',
      dataSync: 'Boyokani ya Makambo',
      syncNow: 'Kosala Boyokani Sikoyo',
      lastSync: 'Boyokani ya suka',
      never: 'Naino te',
      clearData: 'Kolongola makambo nionso',
      clearDataConfirm: 'Ozali na elikya? Oyo ekolongola botalisi nionso oyo ebombami.',
    },
    
    about: {
      title: 'Na Ntina Ya',
      version: 'Version',
      disclaimer: 'Keba Monene',
      disclaimerText: 'Programme oyo ezali ESALELI YA BOTALISI KAKA. Epesaka boyebi ya monganga to lisalisi te. Mbano nionso esengeli endimama na mosali ya bokolongono oyo azali na mayele.',
      purpose: 'Ntina',
      purposeText: 'Kosalisa basali ya bokolongono ya libota koyeba batu oyo bakoki kosengela botalisi ya mayele ya miso.',
      limitations: 'Bandelo',
      limitationsText: 'Emotaka makambo nionso ya miso te. Ezwi esika ya botalisi ya mayele te. Mbano ezali ya kotatola kaka.',
      contact: 'Boyokani mpe Lisalisi',
    },

    apiSettings: {
      title: 'Serveur ONA',
      subtitle: 'Kokangama na serveur ONA pona kosala boyokani ya botalisi',
      serverUrl: 'URL ya serveur',
      email: 'E-mail',
      password: 'Mombongo',
      login: 'Kokota',
      logout: 'Kobima',
      loggedInAs: 'Okoti lokola',
      selectClinic: 'Pona kliniki',
      loadClinics: 'Zwa bakliniki',
      clinicSelected: 'Kliniki eponami',
      noClinic: 'Eloko te',
      pendingSync: 'Ezali kozela boyokani',
      syncNow: 'Sala Boyokani Sikoyo',
      loginRequired: 'Kota mpe pona kliniki pona kosala boyokani ya botalisi.',
    },

    blockchain: {
      title: 'Blockchain',
      subtitle: 'Bilembo ya bopusi oyo eyebani te ebombami na Starknet',
      network: 'Réseau',
      connecting: 'Ezali kokangama…',
      contract: 'Kontra',
      pending: 'Ezali kozela',
      anchored: 'Ebombami',
      onChainTotal: 'Motango nionso na chain',
      privacy: 'Kaka bilembo ya sekele oyo eyebani te ebombami na chain. Ata makambo moko ya mobeli ebimaka na aparey te.',
      proofs: 'Molongo ya bilembo',
      empty: 'Elembo naino te',
      loadDemo: 'Zwa bilembo ya démo',
      anchorToStarknet: 'Bomba na Starknet',
      anchoring: 'Ezali kobomba…',
      viewOnVoyager: 'Tala na Voyager',
      refresh: 'Zongela',
      backHome: 'Zonga na Ndako',
    },
  },
};

export const getTranslation = (lang: Language): Translations => {
  return translations[lang] || translations.en;
};
