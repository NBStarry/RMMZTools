import os
from PIL import Image
from rectpack import newPacker

PIXEL_PER_CUBE = 48

class Tile:
    def __init__(self, dir, resolution=PIXEL_PER_CUBE):
        '''
        dir:        图片所在目录
        resolution: 期望的图片分辨率，分辨率不同的会被缩放
        name:       图片名称
        category:   图片类别
        x, y:       图片的长宽所占格子数
        img:        图片对象
        '''
        self.dir = dir
        self.name = dir.split('\\')[-2]
        self.category = self.name.split('-')[0]
        self.x, self.y = int(self.name.split('-')[1][0]), int(self.name.split('-')[1][1])
        self.img = Image.open(dir)
        if self.img.mode != 'RGBA':
            self.img = self.img.convert('RGBA')
        self.resize(resolution)
        self.resolution = resolution

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

    def pack(self, dir, name, size=(768, 768)):
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

    def pack_by_category(self, dir, suffix):
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