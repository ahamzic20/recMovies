import { Injectable } from '@angular/core';
import neo4j, { Driver, resultTransformers, Session } from 'neo4j-driver';
import { IMovie } from '../models/imovie';

@Injectable({
  providedIn: 'root',
})
export class Neo4jService {
  private driver: Driver | null = null;
  private readonly uri: string = 'bolt://localhost:7687';
  private readonly username: string = 'neo4j';
  private readonly password: string = 'bsf12De53';

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.driver = neo4j.driver(
        this.uri,
        neo4j.auth.basic(this.username, this.password)
      );
      console.log('Connected to Neo4j');
    } catch (error) {
      console.error('Error connecting to Neo4j:', error);
    }
  }


  private async runQuery(query: string, params: any = {}): Promise<any[]> {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized.');
    }

    const session: Session = this.driver.session();

    try {
      const result = await session.run(query, params);
      return result.records.map((record) => record.toObject());
    } catch (error) {
      console.error('Error running query:', error);
      return [];
    } finally {
      await session.close();
    }
  }


  async getMovies(): Promise<IMovie[]> {
    const query = 'MATCH (n:Movie) RETURN n';
    const results = await this.runQuery(query);

    return results.map((record) => record.n.properties);
  }

  async getUserMovies(userId: number): Promise<IMovie[]> {
    var id = userId.toString();
    const query = `
      MATCH (u:User)-[:LIKED]->(m:Movie)
      WHERE u.id = $id
      RETURN m
    `;
    const results = await this.runQuery(query, { id });

    return results.map((record) => record.m.properties);
  }

  async validateUser(username: string, password: string): Promise<number> {
    const query = `
      MATCH (u:User {username: $username, password: $password})
      RETURN u.id AS userId
    `;
    const results = await this.runQuery(query, { username, password });
    if (results.length > 0) {
      return results[0].userId;
    } else {
      return 0;
    }
  }

  async registerUser(username: string, name: string, lastName: string, password: string) {

    const query = `
     CREATE (u:User {username: $username, name: $name, lastName: $lastName, password: $password}) 
     RETURN u
    `;
    const results = await this.runQuery(query, { username, name, lastName, password });

    console.log(results);
    return results[0].records.length > 0 ? 1 : 0;
  }


  async getMovieByFavoriteGenre(userId: number): Promise<IMovie> {
    var id = userId.toString();
    const query = `
      MATCH (u:User {id: $id})-[:LIKED]->(m:Movie)-[:BELONGS_TO]->(g:Genre)
      WITH g.name AS genre, COUNT(*) AS count
      ORDER BY count DESC
      LIMIT 2
      WITH collect(genre) AS topGenres
      WITH topGenres, topGenres[toInteger(rand() * size(topGenres))] AS selectedGenre
      MATCH (m:Movie)-[:BELONGS_TO]->(g:Genre {name: selectedGenre})
      WHERE NOT EXISTS {
      MATCH (u:User {id: $id})-[:LIKED]->(m)
      }
      RETURN m
      ORDER BY rand()
      LIMIT 1
    `;
    const results = await this.runQuery(query, { id });

    console.log(results);

    return results[0].m.properties;
  }

  async getMovieByFavoriteActor(userId: number): Promise<IMovie> {
    var id = userId.toString();
    const query = `
      MATCH (u:User {id: $id})-[:LIKED]->(m:Movie)<-[:ACTED_IN]-(a:People)
      WITH u, a, COUNT(*) AS count
      ORDER BY count DESC
      LIMIT 5
      WITH u, collect(a) AS topActors
      WITH u, topActors[toInteger(rand() * size(topActors))] AS selectedActor
      MATCH (selectedActor)-[:ACTED_IN]->(movie:Movie)
      WHERE NOT EXISTS((movie)<-[:LIKED]-(u))
      RETURN movie
      LIMIT 1
    `;
    const results = await this.runQuery(query, { id });

    console.log(results);

    return results[0].movie.properties;
  }

  async getMovieByFavoriteDirector(userId: number): Promise<IMovie> {
    var id = userId.toString();
    const query = `
    MATCH (u:User {id: $id})-[:LIKED]->(m:Movie)<-[:DIRECTED_BY]-(d:People)
    WITH u, d, COUNT(m) AS movieCount
    ORDER BY movieCount DESC
    LIMIT 5
    WITH u, collect(d) AS topDirectors
    WITH u, topDirectors[toInteger(rand() * size(topDirectors))] AS selectedDirector
    MATCH (selectedDirector)-[:DIRECTED_BY]->(movie:Movie)
    WHERE NOT EXISTS((movie)<-[:LIKED]-(u))
    RETURN movie
    LIMIT 1
    `;
    const results = await this.runQuery(query, { id });

    console.log("EEEEJ", results);

    return results[0].movie.properties;
  }

  async getRandomMovie(userId: number): Promise<IMovie> {
    var id = userId.toString();
    const query = `
      MATCH (u:User {id: $id})
            MATCH (m:Movie)
            WHERE NOT (m)<-[:LIKED]-(u)
            WITH m, rand() AS random
            ORDER BY random
            LIMIT 1
            RETURN m
    `;
    const results = await this.runQuery(query, { id });

    console.log(results);

    return results[0].m.properties;
  }

  async postFavoriteMovie(title: string, userId: number): Promise<boolean> {
    var id = userId.toString();
    const query = `
    MATCH (u:User {id: $id}), (m:Movie {title: $title})
    MERGE (u)-[:LIKED]->(m)
    RETURN u, m
    `;
    const results = await this.runQuery(query, { id, title });

    console.log(results);

    if (results && results.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async close() {
    if (this.driver) {
      await this.driver.close();
      console.log('Neo4j connection closed.');
    }
  }
}
