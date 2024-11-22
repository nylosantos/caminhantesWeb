import { Auth, User } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { MutableRefObject, ReactNode } from "react";
import { Doc, Id as DbId } from "../../convex/_generated/dataModel";
import { ConvexReactClient } from "convex/react";

export type PathFirebaseProps = {
  premierLeague: string;
  championsLeague?: string;
};

export type LeagueParticipantsProps = {
  id: string;
  name: string;
  points: number;
};

export type FixturesProps = {
  [index: string]: number | string | boolean | undefined | null;
  AwayTeam: string;
  AwayTeamScore: number | null;
  DateUtc: string;
  Group: string | null;
  HomeTeam: string;
  HomeTeamScore: number | null;
  Location: string;
  MatchNumber: number;
  RoundNumber: number;
};

// TEAM TYPE
export type TeamType = {
  id: string;
  fullName: string;
  shortName: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  country: string;
  badgeUrl: string;
};

// CREATE LEAGUE PROPS
export type CreateLeagueProps = {
  code: string;
  id: string;
  logoUrl: string;
  name: string;
  season: string;
  slug: string;
  createdBy: string;
  games: GameLeaguesProps[];
};

export type GameLeaguesProps = {
  AwayTeam: string;
  AwayTeamScore: number | null;
  DateUtc: string;
  Group: string | null;
  HomeTeam: string;
  HomeTeamScore: number | null;
  Location: string;
  MatchNumber: number;
  RoundNumber: number;
};

// FIREBASE ADMIN LEAGUE GAMES PROPS
export type FirebaseAdminLeagueGamesProps = {
  AwayTeam: string;
  AwayTeamScore: number | null;
  DateUtc: string;
  Group: string | null;
  HomeTeam: string;
  HomeTeamScore: number | null;
  Location: string;
  MatchNumber: number;
  RoundNumber: number;
};

export type FirebaseAdminParticipantsProps = {
  id: string;
  name: string;
  points: string;
};

// FIREBASE USER LEAGUE PROPS
export type FirebaseUserLeagueProps = {
  id: string;
  name: string;
  points: string;
  season: string;
};

// FIREBASE USER LEAGUE GAMES PROPS
export type FirebaseUserLeagueGamesProps = {
  AwayTeam: string;
  AwayTeamScore: number | null;
  DateUtc: string;
  Group: string | null;
  HomeTeam: string;
  HomeTeamScore: number | null;
  Location: string;
  MatchNumber: number;
  RoundNumber: number;
};

// TEAM LOGO PATHS
export type TeamsLogoPathProps = {
  name: string;
  url: string;
};

// YOUTUBE VIDEO

export interface YoutubeAPIData {
  etag: string;
  id: Id;
  kind: string;
  snippet: Snippet;
}

export interface Id {
  kind: string;
  videoId: string;
}

export interface Snippet {
  channelId: string;
  channelTitle: string;
  description: string;
  liveBroadcastContent: string;
  publishTime: string;
  publishedAt: string;
  thumbnails: Thumbnails;
  title: string;
}

export interface Thumbnails {
  default: ThumbnailsTypeProps;
  high: ThumbnailsTypeProps;
  medium: ThumbnailsTypeProps;
}

export interface ThumbnailsTypeProps {
  height: number;
  url: string;
  width: number;
}

// OPEN VIDEO LINK PROPS
export type OpenURLVideoProps = {
  url: string;
  thumbnailUrl: string;
  title: string;
};

export interface ParticipantsProps {
  results: Result[];
  info: Info;
}

interface Result {
  gender: string;
  name: Name;
  location: Location;
  email: string;
  login: Login;
  dob: Dob;
  registered: Registered;
  phone: string;
  cell: string;
  id: IdParticipants;
  picture: Picture;
  nat: string;
}

interface Name {
  title: string;
  first: string;
  last: string;
}

interface Location {
  street: Street;
  city: string;
  state: string;
  country: string;
  postcode: string;
  coordinates: Coordinates;
  timezone: Timezone;
}

interface Street {
  number: number;
  name: string;
}

interface Coordinates {
  latitude: string;
  longitude: string;
}

interface Timezone {
  offset: string;
  description: string;
}

interface Login {
  uuid: string;
  username: string;
  password: string;
  salt: string;
  md5: string;
  sha1: string;
  sha256: string;
}

interface Dob {
  date: string;
  age: number;
}

interface Registered {
  date: string;
  age: number;
}

interface IdParticipants {
  name: string;
  value: string;
}

interface Picture {
  large: string;
  medium: string;
  thumbnail: string;
}

interface Info {
  seed: string;
  results: number;
  page: number;
  version: string;
}

export type ButtonSignProps = {
  isSubmitting: boolean;
  signType: "signIn" | "signUp";
  isClosed?: boolean;
};

export type SetPageProps = {
  prev:
    | "home"
    | "settings"
    | "poolPage"
    | "anotherUserPoolPage"
    | "searchPool"
    | "dashboard"
    | "createLeague"
    | "deleteLeague"
    | "updateLeaguePoints";
  show:
    | "home"
    | "settings"
    | "poolPage"
    | "anotherUserPoolPage"
    | "searchPool"
    | "dashboard"
    | "createLeague"
    | "deleteLeague"
    | "updateLeaguePoints";
};

// -------------------------- POOL PAGE TYPES --------------- //
// GUESSES TYPE
export type GuessesProps = {
  MatchNumber: number;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  RoundNumber: number;
  points: number;
};

export type UpdateGuessesFunctionProps = {
  matchNumber: number;
  inputScore: string;
  type: "home" | "away";
};

export type AllUserGuessesProps = {
  guesses: GuessesProps[];
  id: DbId<"leagues"> | null;
  totalPoints: number;
};

export type GlobalDataContextType = {
  allLeagues: Doc<"leagues">[] | null | undefined;
  allRounds: number[];
  auth: Auth;
  convex: ConvexReactClient;
  competition: Doc<"leagues"> | null | undefined;
  db: Firestore;
  dbLeaguesData: Doc<"leagues">[] | null | undefined;
  dbUsersData: Doc<"users">[] | null | undefined;
  emptyInputGuesses: MutableRefObject<number>;
  filledGuesses: boolean;
  fixturesToShow: FixturesProps[];
  headerTitle: string;
  headerLeftBackIcon: boolean;
  headerRightInfoIcon: boolean;
  inputGuesses: GuessesProps[];
  isMyGuesses: boolean;
  isSubmitting: boolean;
  listToShow: "guesses" | "results" | "ranking";
  loading: boolean;
  login: boolean;
  logged: boolean;
  page: SetPageProps;
  openModal: boolean;
  roundSelected: number | undefined;
  showCopyright: boolean;
  showFooterMenu: boolean;
  teamsLogoPath: TeamsLogoPathProps[];
  user: User | null | undefined;
  userAllGuesses: AllUserGuessesProps[] | undefined | null;
  userData: Doc<"users"> | undefined;
  userPools: Doc<"leagues">[] | undefined | null;

  chooseBorderBgCardColor: (home: string, away: string) => void;
  chooseTextCardColor: (home: string, away: string) => void;
  createLeague: (leagueInfo: CreateLeagueProps) => void;
  deleteLeague: (leagueId: DbId<"leagues">) => void;
  handleClubBadge: (clubName: string) => ReactNode;
  handleFormatClubName: (clubName: string) => string;
  handleDbData: () => Promise<Doc<"users">[] | null | undefined>;
  handleLogout: () => void;
  handleUser: (
    user: User,
    downloadedUsersData: Doc<"users">[] | undefined | null
  ) => void;
  handleUserPools: () => void;
  handleValueInputScore: (
    item: FixturesProps,
    teamLocation: "home" | "away"
  ) => string | undefined;
  onFooterCustomize: (copyright: boolean, menu: boolean) => void;
  onHeaderCustomize: (
    title: string,
    leftBackIcon: boolean,
    rightInfoIcon: boolean
  ) => void;
  setCompetition: (id: Doc<"leagues"> | null | undefined) => void;
  setDbUsersData: (value: Doc<"users">[] | null | undefined) => void;
  setFilledGuesses: (option: boolean) => void;
  setInputGuesses: (guesses: GuessesProps[]) => void;
  setIsSubmitting: (option: boolean) => void;
  setLoading: (value: boolean) => void;
  setLogin: (value: boolean) => void;
  setOpenModal: (value: boolean) => void;
  setPage: (newPage: SetPageProps) => void;
  setRoundSelected: (round: number | undefined) => void;
  toggleGuessesResultsRanking: (
    option: "guesses" | "results" | "ranking"
  ) => void;
  updateStateGuesses: (
    matchNumber: number,
    teamLocation: "home" | "away",
    score: string
  ) => void;
  updatePoints: () => void;
};

// DBADMIN TYPES

// LEAGUES ARRAY

export type ParticipantsTableProps = {
  id: string;
};

export type LeagueGamesTableProps = {
  AwayTeam: string;
  AwayTeamScore: number | null;
  DateUtc: string;
  Group: string | null;
  HomeTeam: string;
  HomeTeamScore: number | null;
  Location: string;
  MatchNumber: number;
  RoundNumber: number;
};

// USERS ARRAY

export type UsersGuessesTableProps = {
  MatchNumber: number;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  Points: number | null;
};

export type UsersLeaguesTableProps = {
  id: string;
  guesses: UsersGuessesTableProps[];
};

export type UsersTableProps = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  role: "user" | "admin" | "mod";
  timestamp: "serverTimestamp()"; // DATE????
  leagues: UsersLeaguesTableProps[];
};

// export type DbAdminProps = {
//   leagues: LeaguesTableProps[];
//   users: UsersTableProps[];
// };
