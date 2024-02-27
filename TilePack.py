# For Windows Now
# TODO: 为每种素材增加高亮动画
import os
from tkinter import Tk, Label, Entry, Button, filedialog, messagebox, OptionMenu, StringVar

from Tile import Tile, TileSet

class TilePackApp:
    def __init__(self, root):
        root.title('素材拼接')
        Label(root, text='源目录：').grid(row=0, column=0)
        source_entry = Entry(root, width=50)
        source_entry.grid(row=0, column=1)
        Button(root, 
               text='浏览...', 
               command=lambda: self.browse_folder(source_entry)
               ).grid(row=0, column=2)
        read_button = Button(root, 
                             text='读取', 
                             command=lambda: self.images_2_tileset(source_entry.get())
                            )
        read_button.grid(row=0, column=3)

        Label(root, text='目标目录：').grid(row=1, column=0)
        dest_entry = Entry(root, width=50)
        dest_entry.grid(row=1, column=1)
        Button(root, 
               text='浏览...', 
               command=lambda: self.browse_folder(dest_entry)
               ).grid(row=1, column=2)

        Label(root, text='闪光文件：').grid(row=2, column=0)
        shine_entry = Entry(root, width=50)
        shine_entry.grid(row=2, column=1)
        Button(root, 
               text='浏览...', 
               command=lambda: self.browse_file(shine_entry)
               ).grid(row=2, column=2)

        Label(root, text='图片名称：').grid(row=3, column=0)
        output_entry = Entry(root, width=50)
        output_entry.grid(row=3, column=1)

        # 处理按钮
        pack_object_button = Button(root, 
                                 text='拼物体图', 
                                 command=lambda: 
                                    self.pack_object_images(
                                        dest_entry.get(), 
                                        output_entry.get())
                                )
        pack_object_button.grid(row=4, column=1)
        pack_shine_object_button = Button(root, 
                                 text='拼闪光物体图', 
                                 command=lambda: 
                                    self.pack_shine_object_images(
                                        dest_entry.get(), 
                                        output_entry.get(), 
                                        shine_entry.get())
                                )
        pack_shine_object_button.grid(row=4, column=2)
        pack_big_object_button = Button(root, 
                                 text='拼大物件图', 
                                 command=lambda: 
                                    self.pack_big_image(
                                        dest_entry.get(), 
                                        output_entry.get()
                                        )
                                )
        pack_big_object_button.grid(row=4, column=3)

        self.root = root
        self.tileset = TileSet()

    def browse_folder(self, entry):
        folder_selected = filedialog.askdirectory()
        entry.delete(0, 'end')
        entry.insert(0, folder_selected)

    def browse_file(self, entry):
        # 使用filedialog.askopenfilename()来获取文件
        file_path = filedialog.askopenfilename()
        entry.delete(0, 'end')  # 清空entry
        entry.insert(0, file_path)  # 插入新的文件路径

    def images_2_tileset(self, source_dir):
        if self.tileset.tiles:
            self.tileset.clear()
        # 读取图片
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                if file.endswith('.png'):
                    dir = os.path.join(root, file)
                    name = dir.split('\\')[-2].split('/')[-1]
                    category = name.split('-')[0]
                    x, y = int(name.split('-')[1][0]), int(name.split('-')[1][1])
                    tile = Tile(dir, name, category, x, y)
                    self.tileset.add_tile(tile)
        messagebox.showinfo("完成", 
                            "图片读取完成, 共读取了{}类，{}张图片".format(
                                len(self.tileset.tiles), 
                                self.tileset.tile_count)
                            )

    def pack_object_images(self, dest_dir, output_name):
        # size = tuple(map(int, self.size_var.get().split('x')))
        size = (576, 384)
        if not output_name:
            messagebox.showwarning("警告", "请输入输出文件名。")
            return
        output_name = '!' + output_name
         
        self.tileset.pack_object(dest_dir, output_name, size)
        self.tileset.clear()
        messagebox.showinfo("完成", "拼接物体图完成！")
    
    def pack_shine_object_images(self, dest_dir, output_name, shine_file):
        # size = tuple(map(int, self.size_var.get().split('x')))
        size = (576, 384)
        if not output_name:
            messagebox.showwarning("警告", "请输入输出文件名。")
            return
        output_name = '!' + output_name
        if not shine_file:
            messagebox.showwarning("警告", "请选择闪光文件。")
            return
         
        self.tileset.pack_shine_object(dest_dir, output_name, shine_file, size)
        self.tileset.clear()
        messagebox.showinfo("完成", "拼接闪光物体图完成！")

    def pack_big_image(self, dest_dir, output_name):
        if not output_name:
            messagebox.showwarning("警告", "请输入输出文件名。")
            return
        output_name = '!$' + output_name
        self.tileset.pack_big_object(dest_dir, output_name)
        self.tileset.clear()
        messagebox.showinfo("完成", "拼接大物件图完成！")

    # def pack_images_by_category(self, dest_dir, suffix):
    #     # 拼接图片 
    #     self.tileset.pack_by_category(dest_dir, suffix)
    #     self.tileset.clear()
    #     messagebox.showinfo("完成", "按类别拼接图片完成！")

# 创建主窗口
root = Tk()
app = TilePackApp(root)
# 运行主循环
root.mainloop()