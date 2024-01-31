import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1697298268394 implements MigrationInterface {
  name = 'Init1697298268394';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "currencyId" uuid NOT NULL, "balance" numeric(32,16) NOT NULL DEFAULT '0', "locked" numeric(32,16) NOT NULL DEFAULT '0', CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_accounts_on_userId" ON "accounts" ("userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "index_accounts_currencyId_and_userId" ON "accounts" ("currencyId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "roleId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "action" character varying NOT NULL, "resourceId" uuid NOT NULL, "condition" json NOT NULL, CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "userIP" character varying NOT NULL, "userAgent" character varying NOT NULL, "topic" character varying NOT NULL, "action" character varying NOT NULL, "result" character varying NOT NULL, "data" text, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_activities_on_userId" ON "activities" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "expires" TIMESTAMP NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "apikeys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "public" character varying NOT NULL, "secret" character varying NOT NULL, "notes" character varying NOT NULL, "type" character varying NOT NULL, "userIps" text, "spot" character varying, "wallet" character varying, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_6be0b0767685db106c2d414cdbb" UNIQUE ("public"), CONSTRAINT "PK_5a37f8db0aa11ac170c74776c7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_apikeys_on_userId" ON "apikeys" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, CONSTRAINT "PK_632484ab9dff41bba94f9b7c85e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "roleId" uuid NOT NULL, "permissionId" uuid NOT NULL, CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "firstName" character varying, "lastName" character varying, "dob" character varying, "address" character varying, "postcode" character varying, "city" character varying, "country" character varying, "metadata" jsonb, CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_profiles_on_userId" ON "profiles" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "markets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "baseUnit" character varying(10) NOT NULL, "quoteUnit" character varying(10) NOT NULL, "amountPrecision" smallint NOT NULL DEFAULT '4', "pricePrecision" smallint NOT NULL DEFAULT '4', "minPrice" numeric(32,16) NOT NULL DEFAULT '0', "maxPrice" numeric(32,16) NOT NULL DEFAULT '0', "minAmount" numeric(32,16) NOT NULL DEFAULT '0', "position" integer NOT NULL DEFAULT '0', "state" smallint NOT NULL DEFAULT '1', CONSTRAINT "PK_dda44129b32f21ae9f1c28dcf99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_markets_on_baseUnit" ON "markets" ("baseUnit") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_markets_on_quoteUnit" ON "markets" ("quoteUnit") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_markets_on_position" ON "markets" ("position") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "index_markets_on_baseUnit_and_quoteUnit" ON "markets" ("baseUnit", "quoteUnit") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "deposits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "currencyId" uuid NOT NULL, "amount" numeric(32,16) NOT NULL, "fee" numeric(32,16) NOT NULL, "address" character varying NOT NULL, "fromAddresses" character varying NOT NULL, "txid" character varying NOT NULL, "txout" integer NOT NULL, "state" integer NOT NULL, "blockNumber" integer NOT NULL, "type" smallint NOT NULL, "tid" character varying NOT NULL, "spread" character varying, "completedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_f49ba0cd446eaf7abb4953385d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_deposits_on_currencyId" ON "deposits" ("currencyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_deposits_on_txid" ON "deposits" ("txid") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_deposits_on_type" ON "deposits" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_deposits_on_state_and_userId_and_currencyId" ON "deposits" ("state", "userId", "currencyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_deposits_on_userId_and_txid" ON "deposits" ("userId", "txid") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "index_deposits_on_currencyId_and_txid_and_txout" ON "deposits" ("currencyId", "txid", "txout") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "blockchains" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "key" character varying NOT NULL, "name" character varying NOT NULL, "client" character varying NOT NULL, "server" character varying NOT NULL, "height" bigint NOT NULL, "explorerAddress" character varying NOT NULL, "explorerTransaction" character varying NOT NULL, "minConfirmation" integer NOT NULL DEFAULT '6', "state" smallint NOT NULL DEFAULT '1', CONSTRAINT "UQ_e2c1a2fd3af5b4dfbebeafc88b2" UNIQUE ("key"), CONSTRAINT "PK_388138041975d49f3d0446cf634" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "index_blockchains_on_key" ON "blockchains" ("key") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_blockchains_on_state" ON "blockchains" ("state") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "currencies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "blockchainId" uuid NOT NULL, "type" character varying NOT NULL DEFAULT 'coin', "depositFee" numeric(32,16) NOT NULL DEFAULT '0', "minDepositAmount" numeric(32,16) NOT NULL DEFAULT '0', "minCollectionAmount" numeric(32,16) NOT NULL DEFAULT '0', "withdrawFee" numeric(32,16) NOT NULL DEFAULT '0', "minWithdrawAmount" numeric(32,16) NOT NULL DEFAULT '0', "withdrawLimit24h" numeric(32,16) NOT NULL DEFAULT '0', "withdrawLimit72h" numeric(32,16) NOT NULL DEFAULT '0', "position" integer NOT NULL DEFAULT '0', "state" smallint NOT NULL DEFAULT '1', "depositState" smallint NOT NULL DEFAULT '1', "withdrawState" smallint NOT NULL DEFAULT '1', "baseFactor" bigint NOT NULL DEFAULT '1', "precision" smallint NOT NULL DEFAULT '8', "iconUrl" character varying NOT NULL, CONSTRAINT "PK_d528c54860c4182db13548e08c4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_currencies_on_position" ON "currencies" ("position") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_currencies_on_state" ON "currencies" ("state") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "recovery_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_533de0ae206825b9ab04e79874e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_recovery_tokens_on_userId" ON "recovery_tokens" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "level" integer NOT NULL DEFAULT '0', "state" smallint NOT NULL DEFAULT '0', "referralId" uuid, "otp" boolean NOT NULL DEFAULT false, "otpSecret" character varying, "verifyCode" character varying, "verifyExpire" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "index_users_on_email" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "blockchainId" uuid NOT NULL, "currencyId" uuid NOT NULL, "address" character varying NOT NULL, "maxBalance" numeric(32,16) NOT NULL DEFAULT '0', "state" smallint NOT NULL DEFAULT '1', "type" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_wallets_on_currencyId" ON "wallets" ("currencyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_wallets_on_state" ON "wallets" ("state") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_wallets_on_type" ON "wallets" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "index_wallets_on_type_and_currencyId_and_state" ON "wallets" ("type", "currencyId", "state") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."index_wallets_on_type_and_currencyId_and_state"`,
    );
    await queryRunner.query(`DROP INDEX "public"."index_wallets_on_type"`);
    await queryRunner.query(`DROP INDEX "public"."index_wallets_on_state"`);
    await queryRunner.query(
      `DROP INDEX "public"."index_wallets_on_currencyId"`,
    );
    await queryRunner.query(`DROP TABLE "wallets"`);
    await queryRunner.query(`DROP INDEX "public"."index_users_on_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP INDEX "public"."index_recovery_tokens_on_userId"`,
    );
    await queryRunner.query(`DROP TABLE "recovery_tokens"`);
    await queryRunner.query(`DROP INDEX "public"."index_currencies_on_state"`);
    await queryRunner.query(
      `DROP INDEX "public"."index_currencies_on_position"`,
    );
    await queryRunner.query(`DROP TABLE "currencies"`);
    await queryRunner.query(`DROP INDEX "public"."index_blockchains_on_state"`);
    await queryRunner.query(`DROP INDEX "public"."index_blockchains_on_key"`);
    await queryRunner.query(`DROP TABLE "blockchains"`);
    await queryRunner.query(
      `DROP INDEX "public"."index_deposits_on_currencyId_and_txid_and_txout"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."index_deposits_on_userId_and_txid"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."index_deposits_on_state_and_userId_and_currencyId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."index_deposits_on_type"`);
    await queryRunner.query(`DROP INDEX "public"."index_deposits_on_txid"`);
    await queryRunner.query(
      `DROP INDEX "public"."index_deposits_on_currencyId"`,
    );
    await queryRunner.query(`DROP TABLE "deposits"`);
    await queryRunner.query(
      `DROP INDEX "public"."index_markets_on_baseUnit_and_quoteUnit"`,
    );
    await queryRunner.query(`DROP INDEX "public"."index_markets_on_position"`);
    await queryRunner.query(`DROP INDEX "public"."index_markets_on_quoteUnit"`);
    await queryRunner.query(`DROP INDEX "public"."index_markets_on_baseUnit"`);
    await queryRunner.query(`DROP TABLE "markets"`);
    await queryRunner.query(`DROP INDEX "public"."index_profiles_on_userId"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "resources"`);
    await queryRunner.query(`DROP INDEX "public"."index_apikeys_on_userId"`);
    await queryRunner.query(`DROP TABLE "apikeys"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP INDEX "public"."index_activities_on_userId"`);
    await queryRunner.query(`DROP TABLE "activities"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."index_accounts_currencyId_and_userId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."index_accounts_on_userId"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
