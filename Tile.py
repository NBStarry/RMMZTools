import os
from PIL import Image
from rectpack import newPacker

PIXEL_PER_CUBE = 48

class Tile:
    def __init__(self, dir, name, category='default', x=1, y=1, resolution=PIXEL_PER_CUBE):
        '''
        dir:        图片所在目录
        resolution: 期望的图片分辨率，分辨率不同的会被缩放
        name:       图片名称
        category:   图片类别
        x, y:       图片的长宽所占格子数
        img:        图片对象
        '''
        self.dir = dir
        self.name = name
        self.category = category
        self.x, self.y = x, y
        self.img = Image.open(dir)
        if self.img.mode != 'RGBA':
            self.img = self.img.convert('RGBA')
        self.resize(resolution)
        self.resolution = resolution

    def copy(self):
        '''
        创建并返回这个Tile对象的一个副本。
        '''
        # 创建一个新的Tile对象，复制所有属性
        copied_tile = Tile(self.dir, self.name, self.category, self.x, self.y, self.resolution)
        
        # 复制图片对象
        copied_tile.img = self.img.copy()
        
        return copied_tile

    def resize(self, resolution):
        self.img = self.img.resize((self.x * resolution, self.y * resolution), Image.Resampling.LANCZOS)

    def save(self, dest_dir):
        self.img.save(dest_dir)


class TileSet:
    def __init__(self, resolution=PIXEL_PER_CUBE):
        '''
        dir:        图集所在目录
        resolution: 期望的图片分辨率，分辨率不同的会被缩放
        tiles:      图集对象列表
        '''
        self.tiles = {}
        self.tile_count = 0
        self.resolution = resolution

    def add_tile(self, tile):
        if tile.resolution != self.resolution:
            tile.resize(self.resolution)
        if tile.category not in self.tiles:
            self.tiles[tile.category] = [tile]
        else:
            self.tiles[tile.category].append(tile)
        self.tile_count += 1
    
    def clear(self):
        self.tiles = {}
        self.tile_count = 0

    def _pack(self, dir, name, size=(768, 768)):
        tileset_img = Image.new('RGBA', size, (255, 255, 255, 0))
        packer = newPacker()
        rid = 0
        for tile_list in self.tiles.values():
            for tile in tile_list:
                packer.add_rect(*tile.img.size, rid)
                rid += 1
        packer.add_bin(size[0], size[1])
        packer.pack()

        rid_to_tile = {}
        rid = 0
        for tile_list in self.tiles.values():
            for tile in tile_list:
                rid_to_tile[rid] = tile
                rid += 1

        # 确保packer返回的是有效的数据
        if not packer.rect_list():
            raise ValueError("拼图失败，图片太多或者图片太大了，无法拼接")
        
        for rect in packer[0]:
            tile = rid_to_tile[rect.rid]
            tileset_img.paste(tile.img, (rect.x, rect.y))
        tileset_img.save(os.path.join(dir, name + '.png'))

    def pack_character(self, dir, name, size=(576, 384)):
        tileset_img = Image.new('RGBA', size, (255, 255, 255, 0))
        tile_width, tile_height = 48, 48

        for i, tile_category in enumerate(self.tiles.keys()):
            for j, tile in enumerate(self.tiles[tile_category][:4]):
                y_offset = (i // 4) * tile_height * 4 + j * tile_height
                for k in range(3):
                    x_offset = (i % 4 * 3 + k) * tile_width
                    # 粘贴tile图像到tileset_img上
                    tileset_img.paste(tile.img, (x_offset, y_offset))
                
        tileset_img.save(os.path.join(dir, name + '.png'))

    def pack_shine_character(self, dir, name, shine_file, size=(576, 384)):
        tileset_img = Image.new('RGBA', size, (255, 255, 255, 0))
        tile_width, tile_height = 48, 48
        shine_width, shine_height = 8, 8
        shine_tile = Tile(shine_file, 
                          name=shine_file.split('\\')[-1].split('.')[0],
                          resolution=shine_width)
        half_shine_tile = Tile(shine_file, 
                               name=shine_file.split('\\')[-1].split('.')[0],
                               resolution=shine_width)
        alpha = half_shine_tile.img.split()[3]
        alpha = alpha.point(lambda p: p * 0.5)
        half_shine_tile.img.putalpha(alpha)

        for i, tile_category in enumerate(self.tiles.keys()):
            for j, tile in enumerate(self.tiles[tile_category][:4]):
                y_offset = (i // 4) * tile_height * 4 + j * tile_height
                x_offset = (i % 4 * 3) * tile_width
                origin_tile = tile.copy()
                tile.img.paste(shine_tile.img, (tile_width - shine_width, 0), shine_tile.img)
                tileset_img.paste(tile.img, (x_offset, y_offset))

                x_offset += tile_width
                tile = origin_tile.copy()
                tile.img.paste(half_shine_tile.img, (tile_width - shine_width, 0), half_shine_tile.img)
                tileset_img.paste(tile.img, (x_offset, y_offset))
                
                x_offset += tile_width
                tileset_img.paste(origin_tile.img, (x_offset, y_offset))
                
        tileset_img.save(os.path.join(dir, name + '.png'))

    def _pack_by_category(self, dir, suffix):
        for category in self.tiles:
            tileset_img = Image.new('RGBA', (576, 384), (255, 255, 255, 0))
            packer = newPacker()

            rid_to_tile = {}
            for rid, tile in enumerate(self.tiles[category]):
                packer.add_rect(*tile.img.size, rid)
                rid_to_tile[rid] = tile
            packer.add_bin(576, 384)
            packer.pack()

            if not packer.rect_list():
                raise ValueError("拼图失败，图片太多或者图片太大了，无法拼接")
            
            for rect in packer[0]:
                tile = self.tiles[category][rect.rid]
                tileset_img.paste(tile.img, (rect.x, rect.y))
            tileset_img.save(os.path.join(dir, category + suffix + '.png'))