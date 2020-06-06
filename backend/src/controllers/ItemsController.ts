import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController {
  static async index(req: Request, res: Response) {
    const items = await knex('items').select('*');

    const serializedItems = items.map((item) => {
      return {
        name: item.title,
        image_url: `http://192.168.1.108:3333/uploads/${item.image}`,
        id: item.id,
      };
    });

    res.json(serializedItems);
  }
}

export default ItemsController;
