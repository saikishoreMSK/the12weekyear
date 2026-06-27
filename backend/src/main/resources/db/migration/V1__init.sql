-- Baseline schema for The 12 Week Year.
--
-- On an EXISTING database (created earlier by Hibernate ddl-auto=update), Flyway is configured
-- with baseline-on-migrate=true, so this V1 is recorded as the baseline and NOT executed — the
-- existing tables are left as-is. On a FRESH database, this script creates the whole schema.
-- Future changes must be added as new V2__, V3__ … migrations (never edit this file).

create table users (
    id              uuid primary key,
    email           varchar(255) not null unique,
    password_hash   varchar(255) not null,
    display_name    varchar(255) not null,
    timezone        varchar(255) not null,
    email_verified  boolean not null default true,
    created_at      timestamptz not null,
    updated_at      timestamptz not null
);

create table refresh_tokens (
    id          uuid primary key,
    user_id     uuid not null,
    token_hash  varchar(255) not null unique,
    expires_at  timestamptz not null,
    revoked     boolean not null,
    created_at  timestamptz not null
);
create index idx_refresh_token_hash on refresh_tokens (token_hash);
create index idx_refresh_token_user on refresh_tokens (user_id);

create table cycles (
    id          uuid primary key,
    user_id     uuid not null,
    title       varchar(120) not null,
    objective   varchar(2000),
    start_date  date not null,
    status      varchar(20) not null,
    created_at  timestamptz not null,
    updated_at  timestamptz not null
);
create index idx_cycle_user on cycles (user_id);

create table goals (
    id             uuid primary key,
    cycle_id       uuid not null,
    category       varchar(50) not null,
    title          varchar(120) not null,
    unit           varchar(30) not null,
    target_value   integer not null,
    current_value  integer not null,
    week_start     integer not null,
    week_end       integer not null,
    created_at     timestamptz not null,
    updated_at     timestamptz not null
);
create index idx_goal_cycle on goals (cycle_id);

create table habits (
    id           uuid primary key,
    user_id      uuid not null,
    name         varchar(100) not null,
    description  varchar(280),
    color        varchar(9),
    start_date   date not null,
    active       boolean not null,
    created_at   timestamptz not null,
    updated_at   timestamptz not null
);
create index idx_habit_user on habits (user_id);

create table habit_completions (
    id               uuid primary key,
    habit_id         uuid not null,
    completion_date  date not null,
    created_at       timestamptz not null,
    constraint uq_habit_completion_day unique (habit_id, completion_date)
);
create index idx_habit_completion_habit on habit_completions (habit_id);

create table weekly_reviews (
    id               uuid primary key,
    user_id          uuid not null,
    cycle_id         uuid not null,
    week_number      integer not null,
    went_well        varchar(2000),
    wasted_time      varchar(2000),
    biggest_win      varchar(2000),
    biggest_blocker  varchar(2000),
    created_at       timestamptz not null,
    updated_at       timestamptz not null,
    constraint uq_review_cycle_week unique (cycle_id, week_number)
);
create index idx_review_cycle on weekly_reviews (cycle_id);
create index idx_review_user on weekly_reviews (user_id);

create table otp_verifications (
    id          uuid primary key,
    user_id     uuid not null,
    purpose     varchar(30) not null,
    code_hash   varchar(255) not null,
    expires_at  timestamptz not null,
    attempts    integer not null,
    consumed    boolean not null,
    created_at  timestamptz not null
);
create index idx_otp_user_purpose on otp_verifications (user_id, purpose);
